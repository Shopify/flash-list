import {
  LayoutParams,
  RVDimension,
  RVLayout,
  RVLayoutInfo,
  RVLayoutManager,
} from "./LayoutManager";
export class RVGridLayoutManagerImpl extends RVLayoutManager {
  private boundedSize: number;

  constructor(params: LayoutParams) {
    super(params);
    this.boundedSize = params.windowSize.width;
  }

  updateLayoutParams(params: LayoutParams): void {
    if (params.windowSize.width !== this.boundedSize) {
      this.boundedSize = params.windowSize.width;
      if (this.layouts.length > 0) {
        this.recomputeLayouts(0, this.layouts.length - 1);
        this.requiresRepaint = true;
      }
    }
    super.updateLayoutParams(params);
  }

  processLayoutInfo(layoutInfo: RVLayoutInfo[], itemCount: number) {
    for (const info of layoutInfo) {
      const { index, dimensions } = info;
      const layout = this.layouts[index];
      layout.width = this.getWidth(index);
      layout.height = dimensions.height;
      layout.isHeightMeasured = true;
      layout.isWidthMeasured = true;
    }
  }

  estimateLayout(index: number) {
    const layout = this.layouts[index];
    layout.width = this.getWidth(index);
    layout.height = this.getEstimatedHeight(index);

    layout.isWidthMeasured = true;
    layout.enforcedWidth = true;
  }

  // Size of the rendered area
  getLayoutSize(): RVDimension {
    if (this.layouts.length === 0) return { width: 0, height: 0 };
    const lastRowTallestItem = this.processAndReturnTallestItemInRow(
      this.layouts.length - 1
    );
    return {
      width: this.boundedSize,
      height: lastRowTallestItem.y + lastRowTallestItem.height,
    };
  }

  recomputeLayouts(startIndex: number, endIndex: number): void {
    const newStartIndex = this.locateFirstNeighbourIndex(startIndex);
    const startVal = this.getLayout(newStartIndex);

    let startX = startVal.x;
    let startY = startVal.y;

    for (let i = newStartIndex; i <= endIndex; i++) {
      const layout = this.getLayout(i);
      if (!this.checkBounds(startX, layout.width)) {
        const tallestItem = this.processAndReturnTallestItemInRow(i);
        startY = tallestItem.y + tallestItem.height;
        startX = 0;
      }

      layout.x = startX;
      layout.y = startY;
      startX += layout.width;
    }
  }

  private getWidth(index: number): number {
    const span = this.getSpanSizeInfo(index).span ?? 1;
    return (this.boundedSize / this.maxColumns) * span;
  }

  private processAndReturnTallestItemInRow(index: number): RVLayout {
    const startIndex = this.locateFirstNeighbourIndex(index);
    const y = this.layouts[startIndex].y;
    let tallestItem: RVLayout | undefined;
    let maxHeight = 0;
    let i = startIndex;
    let isMeasured = false;
    // TODO: Manage precision problems
    while (Math.ceil(this.layouts[i].y) === Math.ceil(y)) {
      const layout = this.layouts[i];
      isMeasured = isMeasured || Boolean(layout.isHeightMeasured);
      maxHeight = Math.max(maxHeight, layout.height);
      if (
        layout.height > (layout.minHeight ?? 0) &&
        layout.height > (tallestItem?.height ?? 0)
      ) {
        tallestItem = layout;
      }

      i++;
      if (i >= this.layouts.length) {
        break;
      }
    }

    tallestItem = tallestItem ?? this.layouts[startIndex];

    if (!isMeasured) {
      return tallestItem;
    }

    if (tallestItem) {
      let targetHeight = tallestItem.height;
      if (maxHeight - tallestItem.height > 1) {
        targetHeight = 0;
        this.requiresRepaint = true;
      }
      i = startIndex;
      // TODO: Manage precision problems
      while (Math.ceil(this.layouts[i].y) === Math.ceil(y)) {
        this.layouts[i].minHeight = targetHeight;
        if (targetHeight > 0) {
          this.layouts[i].height = targetHeight;
        }
        i++;
        if (i >= this.layouts.length) {
          break;
        }
      }
      tallestItem.minHeight = 0;
    }
    return tallestItem;
  }

  private checkBounds(itemX: number, width: number): boolean {
    // TODO: Manage precision problems
    return itemX + width <= this.boundedSize + 0.9;
  }

  private locateFirstNeighbourIndex(startIndex: number): number {
    if (startIndex === 0) {
      return 0;
    }
    let i = startIndex - 1;
    for (; i >= 0; i--) {
      if (this.layouts[i].x === 0) {
        break;
      }
    }
    return Math.max(i, 0);
  }
}
