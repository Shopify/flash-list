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

  // Updates layout information based on the provided layout info. The input can have any index in any order and may impact overall layout.
  modifyLayout(layoutInfo: RVLayoutInfo[], itemCount: number): void {
    // Ensure the layouts array is large enough
    if (this.layouts.length < itemCount) {
      this.layouts.length = itemCount;
    }

    // Update layout information
    for (const info of layoutInfo) {
      const { index, dimensions } = info;
      const layout = this.layouts[index] || { x: 0, y: 0, width: 0, height: 0 };
      layout.width = dimensions.width;
      layout.height = dimensions.height;

      // Compute x and y based on orientation and previous items
      if (index > 0) {
        const prevLayout = this.layouts[index - 1];
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

      this.layouts[index] = layout;
    }
  }

  // Fetch layout info, breaks if unavailable
  getLayout(index: number): RVLayout {
    const layout = this.layouts[index];
    if (!layout) {
      throw new Error(`Layout for index ${index} is unavailable`);
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
    for (const index of indices) {
      delete this.layouts[index];
    }
    this.recomputeLayouts();
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

  // Helper function to recompute layouts after deletion
  private recomputeLayouts(): void {
    for (let i = 0; i < this.layouts.length; i++) {
      const layout = this.layouts[i];
      if (!layout) continue;

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
