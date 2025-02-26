import {
  LayoutParams,
  RVDimension,
  RVLayout,
  RVLayoutInfo,
  RVLayoutManager,
  SpanSizeInfo,
} from "./LayoutManager";
export class RVGridLayoutManagerImpl extends RVLayoutManager {
  private maxColumns: number;
  private boundedSize: number;
  private overrideItemLayout?: (index: number, layout: SpanSizeInfo) => void;
  private matchHeightsWithNeighbours = true;

  constructor(params: LayoutParams) {
    super(params);
    this.boundedSize = params.windowSize.width;
    this.maxColumns = params.maxColumns ?? 1;
    this.overrideItemLayout = params.overrideItemLayout;
    this.matchHeightsWithNeighbours = params.matchHeightsWithNeighbours ?? true;
  }

  updateLayoutParams(params: LayoutParams): void {
    this.overrideItemLayout = params.overrideItemLayout;
  }

  modifyLayout(layoutInfo: RVLayoutInfo[], itemCount: number): void {
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

    for (const info of layoutInfo) {
      const { index, dimensions } = info;
      const layout = this.layouts[index];
      layout.height = dimensions.height;
      layout.isHeightMeasured = true;
      layout.isWidthMeasured = true;
      this.layouts[index] = layout;
      minRecomputeIndex = Math.min(minRecomputeIndex, index);
    }
    if (layoutInfo.length > 0) {
      this.recomputeLayouts(minRecomputeIndex);
    }
  }

  getLayout(index: number): RVLayout {
    const layout = this.layouts[index];
    if (!layout) {
      this.layouts[index] = {
        x: 0,
        y: 0,
        width: this.boundedSize / this.maxColumns,
        height: 200,
        isWidthMeasured: false,
        isHeightMeasured: false,
        enforcedWidth: true,
      };
      return this.layouts[index];
    }
    return layout;
  }

  deleteLayout(indices: number[]): void {
    super.deleteLayout(indices);
    this.recomputeLayouts(Math.min(...indices));
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

  private recomputeLayouts(startIndex = 0): void {
    const newStartIndex = this.locateFirstNeighbourIndex(startIndex);

    const startVal = this.layouts[newStartIndex];

    let startX = startVal.x;
    let startY = startVal.y;

    const itemCount = this.layouts.length;
    const itemSpan: SpanSizeInfo = {};

    for (let i = newStartIndex; i < itemCount; i++) {
      const layout = this.layouts[i];
      this.overrideItemLayout?.(i, itemSpan);
      const span = itemSpan.span ?? 1;
      layout.width = (this.boundedSize / this.maxColumns) * span;
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
