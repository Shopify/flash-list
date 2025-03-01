import { LayoutParams, RVDimension, RVLayoutInfo } from "./LayoutManager";
import { RVLayout } from "./LayoutManager";
import { RVLayoutManager } from "./LayoutManager";

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
  processLayoutInfo(layoutInfo: RVLayoutInfo[], itemCount: number) {
    // Update layout information
    for (const info of layoutInfo) {
      const { index, dimensions } = info;
      const layout = this.layouts[index];
      layout.width = this.horizontal ? dimensions.width : this.boundedSize;
      layout.isHeightMeasured = true;
      layout.isWidthMeasured = true;
      layout.height = dimensions.height;
    }
  }

  estimateLayout(index: number) {
    const layout = this.layouts[index];
    layout.width = this.horizontal
      ? this.getEstimatedWidth(index)
      : this.boundedSize;
    layout.height = this.getEstimatedHeight(index);
    layout.isWidthMeasured = !this.horizontal;
    layout.enforcedWidth = !this.horizontal;
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
  recomputeLayouts(startIndex = 0): void {
    this.updateTallestItem();
    for (let i = startIndex; i < this.layouts.length; i++) {
      const layout = this.getLayout(i);
      if (i > 0) {
        const prevLayout = this.getLayout(i - 1);
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
