// Interface of layout manager for app's listviews

import { MultiTypeAverageWindow } from "../../utils/AverageWindow";
import { ConsecutiveNumbers } from "../helpers/ConsecutiveNumbers";
import {
  findFirstVisibleIndex,
  findLastVisibleIndex,
} from "../utils/findVisibleIndex";
import { areDimensionsNotEqual } from "../utils/measureLayout";
import { ErrorMessages } from "../../errors/ErrorMessages";

/**
 * Base abstract class for layout managers in the recycler view system.
 * Provides common functionality for managing item layouts and dimensions.
 * Supports both horizontal and vertical layouts with dynamic item sizing.
 */
export abstract class RVLayoutManager {
  /** Whether the layout is horizontal (true) or vertical (false) */
  protected horizontal: boolean;
  /** Array of layout information for all items */
  protected layouts: RVLayout[];
  /** Dimensions of the visible window/viewport */
  protected windowSize: RVDimension;
  /** Maximum number of columns in the layout */
  protected maxColumns: number;

  /** Whether to optimize item placement for better space utilization */
  protected optimizeItemArrangement: boolean;

  /** Flag indicating if the layout requires repainting */
  public requiresRepaint = false;

  /** Optional callback to override default item layout */
  private overrideItemLayout: (index: number, layout: SpanSizeInfo) => void;
  /** Optional function to determine item type */
  private getItemType: (index: number) => string;
  /** Window for tracking average heights by item type */
  private heightAverageWindow: MultiTypeAverageWindow;
  /** Window for tracking average widths by item type */
  private widthAverageWindow: MultiTypeAverageWindow;
  /** Maximum number of items to process in a single layout pass */
  private maxItemsToProcess = 250;
  /** Information about item spans and sizes */
  private spanSizeInfo: SpanSizeInfo = {};
  /** Span tracker for each item */
  private spanTracker: (number | undefined)[] = [];

  /** Current max index with changed layout */
  private currentMaxIndexWithChangedLayout = -1;

  /**
   * Last index that was skipped during layout computation.
   * Used to determine if a layout needs to be recomputed.
   */
  private lastSkippedLayoutIndex = Number.MAX_VALUE;

  constructor(params: LayoutParams, previousLayoutManager?: RVLayoutManager) {
    this.heightAverageWindow = new MultiTypeAverageWindow(5, 200);
    this.widthAverageWindow = new MultiTypeAverageWindow(5, 200);
    this.getItemType = params.getItemType;
    this.overrideItemLayout = params.overrideItemLayout;
    this.layouts = previousLayoutManager?.layouts ?? [];
    if (previousLayoutManager) {
      this.updateLayoutParams(params);
    } else {
      this.horizontal = Boolean(params.horizontal);
      this.windowSize = params.windowSize;
      this.maxColumns = params.maxColumns ?? 1;
    }
  }

  /**
   * Gets the estimated width for an item based on its type.
   * @param index Index of the item
   * @returns Estimated width
   */
  protected getEstimatedWidth(index: number): number {
    return this.widthAverageWindow.getCurrentValue(this.getItemType(index));
  }

  /**
   * Gets the estimated height for an item based on its type.
   * @param index Index of the item
   * @returns Estimated height
   */
  protected getEstimatedHeight(index: number): number {
    return this.heightAverageWindow.getCurrentValue(this.getItemType(index));
  }

  /**
   * Abstract method to process layout information for items.
   * @param layoutInfo Array of layout information for items
   * @param itemCount Total number of items in the list
   * @returns Index of first modified layout or void
   */
  protected abstract processLayoutInfo(
    layoutInfo: RVLayoutInfo[],
    itemCount: number
  ): number | void;

  /**
   * Checks if the layout is horizontal.
   * @returns True if horizontal, false if vertical
   */
  isHorizontal(): boolean {
    return this.horizontal;
  }

  /**
   * Gets the dimensions of the visible window.
   * @returns Window dimensions
   */
  getWindowsSize(): RVDimension {
    return this.windowSize;
  }

  /**
   * Gets indices of items currently visible in the viewport.
   * Uses binary search for efficient lookup.
   * @param unboundDimensionStart Start position of viewport (start X or start Y)
   * @param unboundDimensionEnd End position of viewport (end X or end Y)
   * @returns ConsecutiveNumbers containing visible indices
   */
  getVisibleLayouts(
    unboundDimensionStart: number,
    unboundDimensionEnd: number
  ): ConsecutiveNumbers {
    // Find the first visible index
    const firstVisibleIndex = findFirstVisibleIndex(
      this.layouts,
      unboundDimensionStart,
      this.horizontal
    );

    // Find the last visible index
    const lastVisibleIndex = findLastVisibleIndex(
      this.layouts,
      unboundDimensionEnd,
      this.horizontal
    );

    // Collect the indices in the range
    if (firstVisibleIndex !== -1 && lastVisibleIndex !== -1) {
      return new ConsecutiveNumbers(firstVisibleIndex, lastVisibleIndex);
    }
    return ConsecutiveNumbers.EMPTY;
  }

  /**
   * Removes layout information for specified indices and recomputes layout.
   * @param indices Array of indices to remove
   */
  deleteLayout(indices: number[]): void {
    // Sort indices in descending order
    indices.sort((num1, num2) => num2 - num1);

    // Remove elements from the array
    for (const index of indices) {
      this.layouts.splice(index, 1);
    }
    const startIndex = Math.min(...indices);
    // Recompute layouts starting from the smallest index in the original indices array
    this._recomputeLayouts(
      this.getMinRecomputeIndex(startIndex),
      this.getMaxRecomputeIndex(startIndex)
    );
  }

  /**
   * Updates layout information for items and recomputes layout if necessary.
   * @param layoutInfo Array of layout information for items (real measurements)
   * @param totalItemCount Total number of items in the list
   */
  modifyLayout(layoutInfo: RVLayoutInfo[], totalItemCount: number): void {
    this.maxItemsToProcess = Math.max(
      this.maxItemsToProcess,
      layoutInfo.length * 10
    );
    let minRecomputeIndex = Number.MAX_VALUE;

    if (this.layouts.length > totalItemCount) {
      this.layouts.length = totalItemCount;
      this.spanTracker.length = totalItemCount;
      minRecomputeIndex = totalItemCount - 1; // <0 gets skipped so it's safe to set to totalItemCount - 1
    }
    // update average windows
    minRecomputeIndex = Math.min(
      minRecomputeIndex,
      this.computeEstimatesAndMinMaxChangedLayout(layoutInfo)
    );

    if (this.layouts.length < totalItemCount && totalItemCount > 0) {
      const startIndex = this.layouts.length;
      this.layouts.length = totalItemCount;
      this.spanTracker.length = totalItemCount;
      for (let i = startIndex; i < totalItemCount; i++) {
        this.getLayout(i);
        this.getSpan(i);
      }
      this.recomputeLayouts(startIndex, totalItemCount - 1);
    }

    // compute minRecomputeIndex

    minRecomputeIndex = Math.min(
      minRecomputeIndex,
      this.lastSkippedLayoutIndex,
      this.computeMinIndexWithChangedSpan(layoutInfo),
      this.processLayoutInfo(layoutInfo, totalItemCount) ?? minRecomputeIndex,
      this.computeEstimatesAndMinMaxChangedLayout(layoutInfo)
    );

    if (minRecomputeIndex >= 0 && minRecomputeIndex < totalItemCount) {
      const maxRecomputeIndex = this.getMaxRecomputeIndex(minRecomputeIndex);
      this._recomputeLayouts(minRecomputeIndex, maxRecomputeIndex);
    }
    this.currentMaxIndexWithChangedLayout = -1;
  }

  /**
   * Gets layout information for an item at the given index.
   * Creates and initializes a new layout if one doesn't exist.
   * @param index Index of the item
   * @returns Layout information for the item
   */
  getLayout(index: number): RVLayout {
    if (index >= this.layouts.length) {
      throw new Error(ErrorMessages.indexOutOfBounds);
    }
    let layout = this.layouts[index];
    if (!layout) {
      // Create new layout with estimated dimensions
      layout = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      };
      this.layouts[index] = layout;
    }
    if (!layout.isWidthMeasured || !layout.isHeightMeasured) {
      this.estimateLayout(index);
    }
    return layout;
  }

  /**
   * Updates layout parameters and triggers recomputation if necessary.
   * @param params New layout parameters
   */
  updateLayoutParams(params: LayoutParams) {
    this.windowSize = params.windowSize;
    this.horizontal = params.horizontal ?? this.horizontal;
    this.maxColumns = params.maxColumns ?? this.maxColumns;
    this.optimizeItemArrangement =
      params.optimizeItemArrangement ?? this.optimizeItemArrangement;
  }

  getLayoutCount(): number {
    return this.layouts.length;
  }

  /**
   * Abstract method to recompute layouts for items in the given range.
   * @param startIndex Starting index of items to recompute
   * @param endIndex Ending index of items to recompute
   */
  abstract recomputeLayouts(startIndex: number, endIndex: number): void;

  /**
   * Abstract method to get the total size of the layout area.
   * @returns RVDimension containing width and height of the layout
   */
  abstract getLayoutSize(): RVDimension;

  /**
   * Abstract method to estimate layout dimensions for an item.
   * @param index Index of the item to estimate layout for
   */
  protected abstract estimateLayout(index: number): void;

  /**
   * Gets span for an item, applying any overrides.
   * This is intended to be called during a relayout call. The value is tracked and used to determine if a span change has occurred.
   * If skipTracking is true, the operation is not tracked. Can be useful if span is required outside of a relayout call.
   * The tracker is used to call handleSpanChange if a span change has occurred before relayout call.
   * // TODO: improve this contract.
   * @param index Index of the item
   * @returns Span for the item
   */
  protected getSpan(index: number, skipTracking = false): number {
    this.spanSizeInfo.span = undefined;
    this.overrideItemLayout(index, this.spanSizeInfo);
    const span = Math.min(this.spanSizeInfo.span ?? 1, this.maxColumns);
    if (!skipTracking) {
      this.spanTracker[index] = span;
    }
    return span;
  }

  /**
   * Method to handle span change for an item. Can be overridden by subclasses.
   * @param index Index of the item
   */
  protected handleSpanChange(index: number) {}

  /**
   * Gets the maximum index to process in a single layout pass.
   * @param startIndex Starting index
   * @returns Maximum index to process
   */
  private getMaxRecomputeIndex(startIndex: number): number {
    return Math.min(
      Math.max(startIndex, this.currentMaxIndexWithChangedLayout) +
        this.maxItemsToProcess,
      this.layouts.length - 1
    );
  }

  /**
   * Gets the minimum index to process in a single layout pass.
   * @param startIndex Starting index
   * @returns Minimum index to process
   */
  private getMinRecomputeIndex(startIndex: number): number {
    return startIndex;
  }

  private _recomputeLayouts(startIndex: number, endIndex: number): void {
    this.recomputeLayouts(startIndex, endIndex);
    if (
      this.lastSkippedLayoutIndex >= startIndex &&
      this.lastSkippedLayoutIndex <= endIndex
    ) {
      this.lastSkippedLayoutIndex = Number.MAX_VALUE;
    }

    if (endIndex + 1 < this.layouts.length) {
      this.lastSkippedLayoutIndex = Math.min(
        endIndex + 1,
        this.lastSkippedLayoutIndex
      );
      const lastIndex = this.layouts.length - 1;
      // Since layout managers derive height from last indices we need to make
      // sure they're not too much out of sync.
      if (this.layouts[lastIndex].y < this.layouts[endIndex].y) {
        this.recomputeLayouts(this.lastSkippedLayoutIndex, lastIndex);
        this.lastSkippedLayoutIndex = Number.MAX_VALUE;
      }
    }
  }

  /**
   * Computes size estimates and finds the minimum recompute index.
   * @param layoutInfo Array of layout information for items
   * @returns Minimum index that needs recomputation
   */
  private computeEstimatesAndMinMaxChangedLayout(
    layoutInfo: RVLayoutInfo[]
  ): number {
    let minRecomputeIndex = Number.MAX_VALUE;
    for (const info of layoutInfo) {
      const { index, dimensions } = info;
      const storedLayout = this.layouts[index];
      if (
        index >= this.lastSkippedLayoutIndex ||
        !storedLayout ||
        !storedLayout.isHeightMeasured ||
        !storedLayout.isWidthMeasured ||
        areDimensionsNotEqual(storedLayout.height, dimensions.height) ||
        areDimensionsNotEqual(storedLayout.width, dimensions.width)
      ) {
        minRecomputeIndex = Math.min(minRecomputeIndex, index);
        this.currentMaxIndexWithChangedLayout = Math.max(
          this.currentMaxIndexWithChangedLayout,
          index
        );
      }
      this.heightAverageWindow.addValue(
        dimensions.height,
        this.getItemType(index)
      );
      this.widthAverageWindow.addValue(
        dimensions.width,
        this.getItemType(index)
      );
    }
    return minRecomputeIndex;
  }

  private computeMinIndexWithChangedSpan(layoutInfo: RVLayoutInfo[]): number {
    let minIndexWithChangedSpan = Number.MAX_VALUE;
    for (const info of layoutInfo) {
      const { index } = info;
      const span = this.getSpan(index, true);
      const storedSpan = this.spanTracker[index];
      if (span !== storedSpan) {
        this.spanTracker[index] = span;
        this.handleSpanChange(index);
        minIndexWithChangedSpan = Math.min(minIndexWithChangedSpan, index);
      }
    }
    return minIndexWithChangedSpan;
  }
}

/**
 * Configuration parameters for the layout manager
 */
export interface LayoutParams {
  /**
   * The dimensions of the visible window/viewport that displays list items
   * Used to determine which items are visible and need to be rendered
   */
  windowSize: RVDimension;

  /**
   * Determines if the list scrolls horizontally (true) or vertically (false)
   * Affects how items are positioned and which dimension is used for scrolling
   */
  horizontal: boolean;

  /**
   * Maximum number of columns in a grid layout
   * Controls how many items can be placed side by side
   */
  maxColumns: number;

  /**
   * When true, attempts to optimize item placement for better space utilization
   * May affect the ordering of items to minimize empty space
   */
  optimizeItemArrangement: boolean;

  /**
   * Callback to manually override layout properties for specific items
   * Allows custom control over span and size for individual items
   */
  overrideItemLayout: (index: number, layout: SpanSizeInfo) => void;

  /**
   * Function to determine the type of an item at a specific index
   * Used for size estimation and optimization based on item types
   */
  getItemType: (index: number) => string;
}

/**
 * Information about an item's layout including its index and dimensions
 * Used when updating layout information for specific items
 */
export interface RVLayoutInfo {
  /**
   * The index of the item in the data array
   * Used to identify which item this layout information belongs to
   */
  index: number;

  /**
   * The width and height dimensions of the item
   * Used to update the layout manager's knowledge of item sizes
   */
  dimensions: RVDimension;
}

/**
 * Information about an item's span and size in a grid layout
 * Used when overriding default layout behavior for specific items
 */
export interface SpanSizeInfo {
  /**
   * Number of columns/cells this item should span horizontally
   * Used in grid layouts to allow items to take up multiple columns
   */
  span?: number;

  /**
   * Custom size value for the item
   * Can be used to override the default size calculation
   */
  size?: number;
}

/**
 * Complete layout information for a list item
 * Extends RVDimension with positioning and constraint properties
 * Used to position and size ViewHolder components in the list
 */
export interface RVLayout extends RVDimension {
  /**
   * X-coordinate (horizontal position) in pixels
   * Used to position the item horizontally with absolute positioning
   */
  x: number;

  /**
   * Y-coordinate (vertical position) in pixels
   * Used to position the item vertically with absolute positioning
   */
  y: number;

  /**
   * Indicates if the width has been measured from the actual rendered item
   * When false, width may be an estimated value
   */
  isWidthMeasured?: boolean;

  /**
   * Indicates if the height has been measured from the actual rendered item
   * When false, height may be an estimated value
   */
  isHeightMeasured?: boolean;

  /**
   * Minimum height constraint in pixels
   * Applied to the ViewHolder's style to ensure item doesn't shrink below this value
   */
  minHeight?: number;

  /**
   * Minimum width constraint in pixels
   * Applied to the ViewHolder's style to ensure item doesn't shrink below this value
   */
  minWidth?: number;

  /**
   * Maximum height constraint in pixels
   * Applied to the ViewHolder's style to limit item's vertical growth
   */
  maxHeight?: number;

  /**
   * Maximum width constraint in pixels
   * Applied to the ViewHolder's style to limit item's horizontal growth
   */
  maxWidth?: number;

  /**
   * When true, the width value is strictly enforced on the ViewHolder
   * When false, the width is determined by content
   */
  enforcedWidth?: boolean;

  /**
   * When true, the height value is strictly enforced on the ViewHolder
   * When false, the height is determined by content
   */
  enforcedHeight?: boolean;
}

/**
 * Basic dimension interface representing width and height
 * Used throughout the recycler view system to track item sizes
 * and viewport dimensions
 */
export interface RVDimension {
  /**
   * Width in pixels
   * Used for horizontal measurement and positioning
   */
  width: number;

  /**
   * Height in pixels
   * Used for vertical measurement and positioning
   */
  height: number;
}
