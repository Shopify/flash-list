// Interface of layout manager for app's listviews

import { MultiTypeAverageWindow } from "../../utils/AverageWindow";
import {
  findFirstVisibleIndex,
  findLastVisibleIndex,
} from "../utils/findVisibleIndex";

// TODO: Figure out how to estimate size of unrendered items and bidirectional item loading
export abstract class RVLayoutManager {
  protected horizontal: boolean;
  protected layouts: RVLayout[];
  protected windowSize: RVDimension;
  protected spanSizeInfo: SpanSizeInfo = {};
  protected maxColumns: number;
  protected overrideItemLayout?: (index: number, layout: SpanSizeInfo) => void;
  private _getItemType?: (index: number) => string | number;
  private heightAverageWindow: MultiTypeAverageWindow;
  private widthAverageWindow: MultiTypeAverageWindow;

  constructor(params: LayoutParams) {
    this.horizontal = Boolean(params.horizontal);
    this.windowSize = params.windowSize;
    this.layouts = [];
    this.maxColumns = params.maxColumns ?? 1;
    this.heightAverageWindow = new MultiTypeAverageWindow(5, 100);
    this.widthAverageWindow = new MultiTypeAverageWindow(5, 100);
    this._getItemType = params.getItemType;
    this.overrideItemLayout = params.overrideItemLayout;
  }

  private getItemType(index: number): string | number {
    return this._getItemType?.(index) ?? "default";
  }

  protected getEstimatedWidth(index: number): number {
    return this.widthAverageWindow.getCurrentValue(this.getItemType(index));
  }

  protected getEstimatedHeight(index: number): number {
    return this.heightAverageWindow.getCurrentValue(this.getItemType(index));
  }

  // update layout info and return the index of the first modified layout
  // recompute will be called with this return value.
  protected abstract processLayoutInfo(
    layoutInfo: RVLayoutInfo[],
    itemCount: number
  ): number | void;

  isHorizontal(): boolean {
    return this.horizontal;
  }

  getWindowsSize(): RVDimension {
    return this.windowSize;
  }

  // returns visible indices, should be very fast. Use binary search to find the first visible index.
  // Returns visible indices, should be very fast. Return sorted indices.
  getVisibleLayouts(
    unboundDimensionStart: number,
    unboundDimensionEnd: number
  ): number[] {
    const visibleIndices: number[] = [];
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
      for (let i = firstVisibleIndex; i <= lastVisibleIndex; i++) {
        visibleIndices.push(i);
      }
    }
    return visibleIndices;
  }

  // remove layout values and recompute layout.
  deleteLayout(indices: number[]): void {
    // Sort indices in descending order
    indices.sort((num1, num2) => num2 - num1);

    // Remove elements from the array
    for (const index of indices) {
      this.layouts.splice(index, 1);
    }
    // Recompute layouts starting from the smallest index in the original indices array
    this.recomputeLayouts(Math.min(...indices));
  }

  // Updates layout information based on the provided layout info. The input can have any index in any order and may impact overall layout.
  modifyLayout(layoutInfo: RVLayoutInfo[], totalItemCount: number): void {
    if (this.layouts.length > totalItemCount) {
      this.layouts.length = totalItemCount;
    }

    // TODO
    // if (layoutInfo.length === 0) {
    //   return;
    // }

    // update average windows
    for (const info of layoutInfo) {
      const { index, dimensions } = info;
      this.heightAverageWindow.addValue(
        dimensions.height,
        this.getItemType(index)
      );
      this.widthAverageWindow.addValue(
        dimensions.width,
        this.getItemType(index)
      );
    }

    console.log(
      "average sizes",
      this.heightAverageWindow.getCurrentValue(this.getItemType(0)),
      this.widthAverageWindow.getCurrentValue(this.getItemType(0))
    );

    // console.log(
    //   "layouts",
    //   this.layouts.map((l) => l.height)
    // );

    if (this.layouts.length < totalItemCount) {
      const startIndex = this.layouts.length;
      for (let i = this.layouts.length; i < totalItemCount; i++) {
        this.getLayout(i);
      }
      this.recomputeLayouts(startIndex);
    }

    let minRecomputeIndex = Number.MAX_VALUE;

    // compute minRecomputeIndex
    for (const info of layoutInfo) {
      const { index, dimensions } = info;
      const layout = this.layouts[index];
      if (
        layout.width !== dimensions.width ||
        layout.height !== dimensions.height
      ) {
        minRecomputeIndex = Math.min(minRecomputeIndex, index);
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

    const finalMinRecomputeIndex =
      this.processLayoutInfo(layoutInfo, totalItemCount) ?? minRecomputeIndex;
    if (
      finalMinRecomputeIndex >= 0 &&
      finalMinRecomputeIndex < totalItemCount
    ) {
      this.recomputeLayouts(finalMinRecomputeIndex);
    }
  }

  // Returns layout info for an item at given index
  // Creates and initializes a new layout if one doesn't exist
  getLayout(index: number): RVLayout {
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

  abstract estimateLayout(index: number): void;

  abstract recomputeLayouts(startIndex: number): void;

  // Size of the rendered area
  abstract getLayoutSize(): RVDimension;

  // recompute if critical layout information changes, can be called with same values repeatedly so only recompute if necessary
  abstract updateLayoutParams(params: LayoutParams): void;

  protected getSpanSizeInfo(index: number): SpanSizeInfo {
    this.spanSizeInfo.span = undefined;
    this.overrideItemLayout?.(index, this.spanSizeInfo);
    return this.spanSizeInfo;
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
  horizontal?: boolean;

  /**
   * Maximum number of columns in a grid layout
   * Controls how many items can be placed side by side
   */
  maxColumns?: number;

  /**
   * When true, attempts to optimize item placement for better space utilization
   * May affect the ordering of items to minimize empty space
   */
  optimizeItemArrangement?: boolean;

  /**
   * Callback to manually override layout properties for specific items
   * Allows custom control over span and size for individual items
   */
  overrideItemLayout?: (index: number, layout: SpanSizeInfo) => void;

  /**
   * When true, attempts to match heights of neighboring items
   * Helps create a more uniform appearance in grid layouts
   */
  matchHeightsWithNeighbours?: boolean;

  /**
   * Function to determine the type of an item at a specific index
   * Used for size estimation and optimization based on item types
   */
  getItemType?: (index: number) => string | number;
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
