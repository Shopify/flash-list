import {
  LayoutParams,
  RVDimension,
  RVLayout,
  RVLayoutInfo,
  RVLayoutManager,
  SpanSizeInfo,
} from "./LayoutManager";

export class RVMasonryLayoutManagerImpl extends RVLayoutManager {
  private numColumns: number;
  private boundedSize: number;
  private columnHeights: number[];
  private optimizeItemArrangement: boolean;
  private overrideItemLayout?: (index: number, layout: SpanSizeInfo) => void;
  private currentColumn: number = 0;

  constructor(params: LayoutParams) {
    super(params);
    this.boundedSize = params.windowSize.width;
    this.numColumns = params.maxColumns ?? 2;
    this.optimizeItemArrangement = params.optimizeItemArrangement ?? false;
    this.overrideItemLayout = params.overrideItemLayout;
    this.columnHeights = Array(this.numColumns).fill(0);
  }

  updateLayoutParams(params: LayoutParams): void {}

  processLayoutInfo(layoutInfo: RVLayoutInfo[], itemCount: number) {
    // Update layout information
    for (const info of layoutInfo) {
      const { index, dimensions } = info;
      const layout = this.layouts[index];
      layout.height = dimensions.height;
      layout.isHeightMeasured = true;
      layout.isWidthMeasured = true;
      this.layouts[index] = layout;
    }
  }

  getLayout(index: number): RVLayout {
    const layout = this.layouts[index];
    if (!layout) {
      // Create a default layout for new items
      const itemSpan: SpanSizeInfo = {};
      this.overrideItemLayout?.(index, itemSpan);
      const span = Math.min(itemSpan.span ?? 1, this.numColumns);

      this.layouts[index] = {
        x: 0,
        y: 0,
        width: (this.boundedSize / this.numColumns) * span,
        height: 200, // Default height, will be updated when measured
        isWidthMeasured: true,
        isHeightMeasured: false,
        enforcedWidth: true,
      };
      return this.layouts[index];
    }
    return layout;
  }

  getLayoutSize(): RVDimension {
    if (this.layouts.length === 0) return { width: 0, height: 0 };

    // Find the tallest column
    const maxHeight = Math.max(...this.columnHeights);

    return {
      width: this.boundedSize,
      height: maxHeight,
    };
  }

  recomputeLayouts(startIndex = 0): void {
    // Reset column heights if starting from the beginning
    if (startIndex === 0) {
      this.columnHeights = Array(this.numColumns).fill(0);
      this.currentColumn = 0;
    } else {
      // Find the y-position of the first item to recompute
      // and adjust column heights accordingly
      this.updateColumnHeightsToIndex(startIndex);
    }

    const itemCount = this.layouts.length;
    const itemSpan: SpanSizeInfo = {};

    for (let i = startIndex; i < itemCount; i++) {
      const layout = this.layouts[i];

      // Get span information if available
      this.overrideItemLayout?.(i, itemSpan);
      const span = Math.min(itemSpan.span ?? 1, this.numColumns);

      // Update width based on span
      layout.width = (this.boundedSize / this.numColumns) * span;

      if (this.optimizeItemArrangement) {
        if (span === 1) {
          // For single column items, place in the shortest column
          this.placeSingleColumnItem(layout);
        } else {
          // For multi-column items, find the best position
          this.placeOptimizedMultiColumnItem(layout, span);
        }
      } else {
        // No optimization - place items sequentially
        this.placeItemSequentially(layout, span);
      }
    }
  }

  private placeItemSequentially(layout: RVLayout, span: number): void {
    // Check if the item can fit in the current row
    if (this.currentColumn + span > this.numColumns) {
      // Move to the next row
      this.currentColumn = 0;
    }

    // Find the maximum height of the columns this item will span
    let maxHeight = this.columnHeights[this.currentColumn];
    for (
      let col = this.currentColumn + 1;
      col < this.currentColumn + span;
      col++
    ) {
      if (col < this.numColumns) {
        maxHeight = Math.max(maxHeight, this.columnHeights[col]);
      }
    }

    // Place the item
    layout.x = (this.boundedSize / this.numColumns) * this.currentColumn;
    layout.y = maxHeight;

    // Update column heights
    for (let col = this.currentColumn; col < this.currentColumn + span; col++) {
      if (col < this.numColumns) {
        this.columnHeights[col] = maxHeight + layout.height;
      }
    }

    // Move to the next column
    this.currentColumn += span;
    if (this.currentColumn >= this.numColumns) {
      this.currentColumn = 0;
    }
  }

  private placeSingleColumnItem(layout: RVLayout): void {
    // Find the shortest column
    let shortestColumnIndex = 0;
    let minHeight = this.columnHeights[0];

    for (let i = 1; i < this.numColumns; i++) {
      if (this.columnHeights[i] < minHeight) {
        minHeight = this.columnHeights[i];
        shortestColumnIndex = i;
      }
    }

    // Place the item in the shortest column
    layout.x = (this.boundedSize / this.numColumns) * shortestColumnIndex;
    layout.y = this.columnHeights[shortestColumnIndex];

    // Update the column height
    this.columnHeights[shortestColumnIndex] += layout.height;
  }

  private placeOptimizedMultiColumnItem(layout: RVLayout, span: number): void {
    let bestStartColumn = 0;
    let minTotalHeight = Number.MAX_VALUE;

    // Try all possible positions
    for (let startCol = 0; startCol <= this.numColumns - span; startCol++) {
      // Find the maximum height among the columns this item would span
      let maxHeight = this.columnHeights[startCol];
      for (let col = startCol + 1; col < startCol + span; col++) {
        maxHeight = Math.max(maxHeight, this.columnHeights[col]);
      }

      // Calculate the total height after placing the item
      let totalHeight = 0;
      for (let col = 0; col < this.numColumns; col++) {
        if (col >= startCol && col < startCol + span) {
          totalHeight += maxHeight + layout.height;
        } else {
          totalHeight += this.columnHeights[col];
        }
      }

      // Update best position if this is better
      if (totalHeight < minTotalHeight) {
        minTotalHeight = totalHeight;
        bestStartColumn = startCol;
      }
    }

    // Place the item at the best position
    const maxHeight = Math.max(
      ...this.columnHeights.slice(bestStartColumn, bestStartColumn + span)
    );
    layout.x = (this.boundedSize / this.numColumns) * bestStartColumn;
    layout.y = maxHeight;

    // Update column heights
    for (let col = bestStartColumn; col < bestStartColumn + span; col++) {
      this.columnHeights[col] = maxHeight + layout.height;
    }
  }

  private updateColumnHeightsToIndex(index: number): void {
    // Reset column heights
    this.columnHeights = Array(this.numColumns).fill(0);
    this.currentColumn = 0;

    // Recalculate column heights up to the given index
    for (let i = 0; i < index; i++) {
      const layout = this.layouts[i];
      const itemWidth = layout.width;
      const columnWidth = this.boundedSize / this.numColumns;
      const span = Math.round(itemWidth / columnWidth);

      // Find which columns this item spans
      const startColumn = Math.round(layout.x / columnWidth);
      const endColumn = Math.min(startColumn + span, this.numColumns);

      // Update column heights
      for (let col = startColumn; col < endColumn; col++) {
        this.columnHeights[col] = Math.max(
          this.columnHeights[col],
          layout.y + layout.height
        );
      }

      // Update current column for non-optimized layout
      if (!this.optimizeItemArrangement) {
        this.currentColumn = (startColumn + span) % this.numColumns;
      }
    }
  }
}
