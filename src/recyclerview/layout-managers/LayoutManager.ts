// Interface of layout manager for app's listviews

import {
  findFirstVisibleIndex,
  findLastVisibleIndex,
} from "../utils/findVisibleIndex";

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
  optimizeItemArrangement?: boolean;
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
