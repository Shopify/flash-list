import {
  LayoutParams,
  RVDimension,
  RVLayout,
  RVLayoutInfo,
  RVLayoutManager,
} from "./LayoutManager";
export class RVGridLayoutManagerImpl extends RVLayoutManager {
  private boundedSize: number;
  private matchHeightsWithNeighbours = true;

  constructor(params: LayoutParams) {
    super(params);
    this.boundedSize = params.windowSize.width;
    this.matchHeightsWithNeighbours = params.matchHeightsWithNeighbours ?? true;
  }

  processLayoutInfo(layoutInfo: RVLayoutInfo[], itemCount: number) {
    for (const info of layoutInfo) {
      const { index, dimensions } = info;
      const layout = this.layouts[index];
      layout.height = dimensions.height;
      layout.isHeightMeasured = true;
      layout.isWidthMeasured = true;
    }
  }

  estimateLayout(index: number) {
    const layout = this.layouts[index];

    // Apply span information if available
    const span = this.getSpanSizeInfo(index).span ?? 1;

    // Set width based on columns and span
    layout.width = (this.boundedSize / this.maxColumns) * span;
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

  recomputeLayouts(startIndex = 0): void {
    const newStartIndex = this.locateFirstNeighbourIndex(startIndex);

    const startVal = this.getLayout(newStartIndex);

    let startX = startVal.x;
    let startY = startVal.y;

    const itemCount = this.layouts.length;

    for (let i = newStartIndex; i < itemCount; i++) {
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

  private processAndReturnTallestItemInRow(index: number): RVLayout {
    const startIndex = this.locateFirstNeighbourIndex(index);
    const y = this.layouts[startIndex].y;
    let tallestItem = this.layouts[startIndex];
    let i = startIndex;
    // TODO: Manage precision problems
    while (Math.ceil(this.layouts[i].y) === Math.ceil(y)) {
      const layout = this.layouts[i];
      if (layout.minHeight === 0 && layout.height >= tallestItem.height) {
        tallestItem = layout;
      } else if (
        layout.height > (layout.minHeight ?? 0) &&
        layout.height > tallestItem.height
      ) {
        tallestItem = layout;
      }
      i++;
      if (i >= this.layouts.length) {
        break;
      }
    }
    if (this.matchHeightsWithNeighbours) {
      i = startIndex;
      // TODO: Manage precision problems
      while (Math.ceil(this.layouts[i].y) === Math.ceil(y)) {
        this.layouts[i].minHeight = tallestItem.height;
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
