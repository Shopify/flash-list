// Interface of layout manager for app's listviews

import {
  findFirstVisibleIndex,
  findLastVisibleIndex,
} from "./utils/findVisibleIndex";

// TODO: Figure out how to estimate size of unrendered items and bidirectional item loading
export abstract class RVLayoutManager {
  protected horizontal: boolean;
  protected layouts: RVLayout[];
  protected windowSize: RVDimension;

  constructor(params: LayoutParams) {
    this.horizontal = Boolean(params.horizontal);
    this.windowSize = params.windowSize;
    this.layouts = [];
  }

  isHorizontal(): boolean {
    return this.horizontal;
  }

  // fetch layout info, breaks if unavailable
  getLayout(index: number): RVLayout {
    return this.layouts[index];
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

  // remove layout values and recompute layout. Avoid complete recomputation if possible.
  deleteLayout(indices: number[]): void {
    // Sort indices in descending order
    indices.sort((num1, num2) => num2 - num1);

    // Remove elements from the array
    for (const index of indices) {
      this.layouts.splice(index, 1);
    }
  }

  // Updates layout information based on the provided layout info. The input can have any index in any order and may impact overall layout.
  abstract modifyLayout(layoutInfo: RVLayoutInfo[], itemCount: number): void;

  // Size of the rendered area
  abstract getLayoutSize(): RVDimension;

  // recompute if critical layout information changes, can be called with same values repeatedly so only recompute if necessary
  abstract updateLayoutParams(params: LayoutParams): void;
}

export interface LayoutParams {
  windowSize: RVDimension;
  horizontal?: boolean;
  maxColumns?: number;
  overrideItemLayout?: (index: number, layout: SpanSizeInfo) => void;
  matchHeightsWithNeighbours?: boolean;
}

export interface RVLayoutInfo {
  index: number;
  dimensions: RVDimension;
}

export interface SpanSizeInfo {
  span?: number;
  size?: number;
}

// update compareLayout method if anything changes here.
export interface RVLayout extends RVDimension {
  x: number;
  y: number;
  isWidthMeasured?: boolean;
  isHeightMeasured?: boolean;
  minHeight?: number;
  minWidth?: number;
  maxHeight?: number;
  maxWidth?: number;
  enforcedWidth?: boolean;
  enforcedHeight?: boolean;
}

export interface RVDimension {
  width: number;
  height: number;
}

export class RVLinearLayoutManagerImpl extends RVLayoutManager {
  private boundedSize: number;

  private tallestItem?: RVLayout;

  constructor(params: LayoutParams) {
    super(params);
    this.boundedSize = this.horizontal
      ? params.windowSize.height
      : params.windowSize.width;
  }

  updateLayoutParams(params: LayoutParams): void {
    // TODO: Implement this
  }

  // Updates layout information based on the provided layout info.
  modifyLayout(layoutInfo: RVLayoutInfo[], itemCount: number): void {
    // only keep itemCount number of layouts, delete the rest using splice
    if (this.layouts.length > itemCount) {
      this.layouts.splice(itemCount, this.layouts.length - itemCount);
    } else if (this.layouts.length < itemCount) {
      const startIndex = this.layouts.length;
      for (let i = this.layouts.length; i < itemCount; i++) {
        this.layouts[i] = this.getLayout(i);
      }
      this.recomputeLayouts(startIndex);
    }
    let minRecomputeIndex = Number.MAX_VALUE;

    // Update layout information
    for (const info of layoutInfo) {
      const { index, dimensions } = info;
      const layout = this.layouts[index];
      layout.width = this.horizontal ? dimensions.width : this.boundedSize;
      layout.isHeightMeasured = true;
      layout.isWidthMeasured = true;

      layout.height = dimensions.height;
      this.layouts[index] = layout;
      minRecomputeIndex = Math.min(minRecomputeIndex, index);
    }

    // Recompute layouts starting from the first modified index
    this.recomputeLayouts(minRecomputeIndex);
  }

  // Fetch layout info, breaks if unavailable
  getLayout(index: number): RVLayout {
    const layout = this.layouts[index];
    if (!layout) {
      // TODO
      this.layouts[index] = {
        x: 0,
        y: 0,
        // TODO: horizontal list size management required
        width: this.horizontal ? 200 : this.boundedSize,
        height: this.horizontal ? 0 : 200,
        isWidthMeasured: true,
        enforcedWidth: !this.horizontal,
      };
      return this.layouts[index];
    }
    return layout;
  }

  // Remove layout values and recompute layout.
  deleteLayout(indices: number[]): void {
    super.deleteLayout(indices);

    // Recompute layouts starting from the smallest index in the original indices array
    this.recomputeLayouts(Math.min(...indices));
  }

  // Size of the rendered area
  getLayoutSize(): RVDimension {
    if (this.layouts.length === 0) return { width: 0, height: 0 };
    const lastLayout = this.layouts[this.layouts.length - 1];
    return {
      width: this.horizontal
        ? lastLayout.x + lastLayout.width
        : this.boundedSize,
      height: this.horizontal
        ? this.tallestItem?.height ?? 0
        : lastLayout.y + lastLayout.height,
    };
  }

  private updateTallestItem() {
    let newTallestItem: RVLayout | undefined;
    for (const layout of this.layouts) {
      if (
        layout.height > (layout.minHeight ?? 0) &&
        layout.height > (newTallestItem?.height ?? 0)
      ) {
        newTallestItem = layout;
      }
    }
    if (newTallestItem) {
      this.tallestItem = newTallestItem;
    }
  }

  // Helper function to recompute layouts starting from a given index
  private recomputeLayouts(startIndex = 0): void {
    this.updateTallestItem();
    for (let i = startIndex; i < this.layouts.length; i++) {
      const layout = this.getLayout(i);
      if (i > 0) {
        const prevLayout = this.layouts[i - 1];
        if (this.horizontal) {
          layout.x = prevLayout.x + prevLayout.width;
          layout.y = 0;
          layout.minHeight = this.tallestItem?.height ?? 0;
        } else {
          layout.x = 0;
          layout.y = prevLayout.y + prevLayout.height;
        }
      } else {
        layout.x = 0;
        layout.y = 0;
        layout.minHeight = this.horizontal ? this.tallestItem?.height ?? 0 : 0;
      }
    }
    if (this.tallestItem) {
      this.tallestItem.minHeight = 0;
    }
  }
}
