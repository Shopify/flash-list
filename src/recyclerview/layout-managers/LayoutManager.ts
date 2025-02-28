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
  private _getItemType?: (index: number) => string | number;
  private heightAverageWindow: MultiTypeAverageWindow;
  private widthAverageWindow: MultiTypeAverageWindow;

  constructor(params: LayoutParams) {
    this.horizontal = Boolean(params.horizontal);
    this.windowSize = params.windowSize;
    this.layouts = [];
    this.heightAverageWindow = new MultiTypeAverageWindow(30, 100);
    this.widthAverageWindow = new MultiTypeAverageWindow(30, 100);
    this._getItemType = params.getItemType;
  }

  private getItemType(index: number): string | number {
    return this._getItemType?.(index) ?? "default";
  }

  isHorizontal(): boolean {
    return this.horizontal;
  }

  // fetch layout info, estimates and stores if unavailable
  getLayout(index: number): RVLayout {
    // if (index >= this.layouts.length) {
    //   console.log("index", index, this.layouts.length);
    //   throw new Error("Index out of bounds");
    // }
    if (!this.layouts[index]) {
      this.layouts[index] = {
        width: this.widthAverageWindow.getCurrentValue(this.getItemType(index)),
        height: this.heightAverageWindow.getCurrentValue(
          this.getItemType(index)
        ),
        x: 0,
        y: 0,
      };
    }
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

    console.log(
      "layouts",
      this.layouts.map((l) => l.height)
    );

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

  // update layout info and return the index of the first modified layout
  // recompute will be called with this return value.
  protected abstract processLayoutInfo(
    layoutInfo: RVLayoutInfo[],
    itemCount: number
  ): number | void;

  abstract recomputeLayouts(startIndex: number): void;

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
  getItemType?: (index: number) => string | number;
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
