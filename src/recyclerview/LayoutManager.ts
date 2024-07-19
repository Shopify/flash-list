// Interface of layout manager for app's listviews
// TODO: Figure out how to estimate size of unrendered items and bidirectional item loading
export interface RVLayoutManager {
  // Updates layout information based on the provided layout info. The input can have any index in any order and may impact overall layout.
  modifyLayout: (layoutInfo: RVLayoutInfo[], itemCount: number) => void;
  // fetch layout info, breaks if unavailable
  getLayout: (index: number) => RVLayout;
  // returns visible indices, should be very fast. Use binary search to find the first visible index.
  getVisibleLayouts: (
    unboundDimensionStart: number,
    unboundDimensionEnd: number
  ) => number[];
  // remove layout values and recompute layout. Avoid complete recomputation if possible.
  deleteLayout: (index: number[]) => void;
  // Size of the rendered area
  getLayoutSize: () => RVDimension;
}

export interface RVLayoutInfo {
  index: number;
  dimensions: RVDimension;
}

export interface RVLayout extends RVDimension {
  x: number;
  y: number;
}

export interface RVDimension {
  width: number;
  height: number;
}

export class RVLayoutManagerImpl implements RVLayoutManager {
  private boundedSize: number;
  private isHorizontal: boolean;
  private layouts: RVLayout[];

  constructor(boundedSize: number, isHorizontal: boolean) {
    this.boundedSize = boundedSize;
    this.isHorizontal = isHorizontal;
    this.layouts = [];
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
      layout.width = this.isHorizontal ? dimensions.width : this.boundedSize;
      // layout.width = dimensions.width;

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
        width: this.boundedSize,
        height: 200,
      };
      return this.layouts[index];
    }
    return layout;
  }

  // Returns visible indices, should be very fast. Return sorted indices.
  getVisibleLayouts(
    unboundDimensionStart: number,
    unboundDimensionEnd: number
  ): number[] {
    const visibleIndices: number[] = [];
    for (let i = 0; i < this.layouts.length; i++) {
      const layout = this.layouts[i];
      if (!layout) continue;

      const start = this.isHorizontal ? layout.x : layout.y;
      const end = this.isHorizontal
        ? layout.x + layout.width
        : layout.y + layout.height;

      if (end >= unboundDimensionStart && start <= unboundDimensionEnd) {
        visibleIndices.push(i);
      }
    }
    return visibleIndices;
  }

  // Remove layout values and recompute layout.
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

  // Size of the rendered area
  getLayoutSize(): RVDimension {
    if (this.layouts.length === 0) return { width: 0, height: 0 };

    const lastLayout = this.layouts[this.layouts.length - 1];
    return {
      width: this.isHorizontal
        ? lastLayout.x + lastLayout.width
        : this.boundedSize,
      height: this.isHorizontal
        ? this.boundedSize
        : lastLayout.y + lastLayout.height,
    };
  }

  // Helper function to recompute layouts starting from a given index
  private recomputeLayouts(startIndex = 0): void {
    for (let i = startIndex; i < this.layouts.length; i++) {
      const layout = this.getLayout(i);
      if (i > 0) {
        const prevLayout = this.layouts[i - 1];
        if (this.isHorizontal) {
          layout.x = prevLayout.x + prevLayout.width;
          layout.y = 0;
        } else {
          layout.x = 0;
          layout.y = prevLayout.y + prevLayout.height;
        }
      } else {
        layout.x = 0;
        layout.y = 0;
      }
    }
  }
}
