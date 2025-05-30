import {
  LayoutParams,
  RVDimension,
  RVLayout,
  RVLayoutInfo,
  RVLayoutManager,
} from "./LayoutManager";

/**
 * MasonryLayoutManager implementation that arranges items in a masonry/pinterest-style layout.
 * Items are placed in columns, with support for items spanning multiple columns.
 * Can optimize item placement to minimize column height differences.
 */
export class RVMasonryLayoutManagerImpl extends RVLayoutManager {
  /** The width of the bounded area for the masonry layout */
  private boundedSize: number;
  /** Array tracking the current height of each column */
  private columnHeights: number[];
  /** Current column index for sequential placement */
  private currentColumn = 0;

  /** If there's a span change for masonry layout, we need to recompute all the widths */
  private fullRelayoutRequired = false;

  constructor(params: LayoutParams, previousLayoutManager?: RVLayoutManager) {
    super(params, previousLayoutManager);
    this.boundedSize = params.windowSize.width;
    this.optimizeItemArrangement = params.optimizeItemArrangement;
    this.columnHeights = this.columnHeights ?? Array(this.maxColumns).fill(0);
  }

  /**
   * Updates layout parameters and triggers recomputation if necessary.
   * @param params New layout parameters
   */
  updateLayoutParams(params: LayoutParams) {
    const prevMaxColumns = this.maxColumns;
    const prevOptimizeItemArrangement = this.optimizeItemArrangement;
    super.updateLayoutParams(params);
    if (
      this.boundedSize !== params.windowSize.width ||
      prevMaxColumns !== params.maxColumns ||
      prevOptimizeItemArrangement !== params.optimizeItemArrangement
    ) {
      this.boundedSize = params.windowSize.width;
      if (this.layouts.length > 0) {
        // console.log("-----> recomputeLayouts");

        // update all widths
        this.updateAllWidths();
        this.recomputeLayouts(0, this.layouts.length - 1);
        this.requiresRepaint = true;
      }
    }
  }

  /**
   * Processes layout information for items, updating their dimensions.
   * @param layoutInfo Array of layout information for items (real measurements)
   * @param itemCount Total number of items in the list
   */
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

    // TODO: Can be optimized
    if (this.fullRelayoutRequired) {
      this.updateAllWidths();
      this.fullRelayoutRequired = false;
      return 0;
    }
  }

  /**
   * Estimates layout dimensions for an item at the given index.
   * Can be called by base class if estimate is required.
   * @param index Index of the item to estimate layout for
   */
  estimateLayout(index: number) {
    const layout = this.layouts[index];

    // Set width based on columns and span
    layout.width = this.getWidth(index);
    layout.height = this.getEstimatedHeight(index);

    layout.isWidthMeasured = true;
    layout.enforcedWidth = true;
  }

  /**
   * Handles span change for an item.
   * @param index Index of the item
   */
  handleSpanChange(index: number) {
    this.fullRelayoutRequired = true;
  }

  /**
   * Returns the total size of the layout area.
   * @returns RVDimension containing width and height of the layout
   */
  getLayoutSize(): RVDimension {
    if (this.layouts.length === 0) return { width: 0, height: 0 };

    // Find the tallest column
    const maxHeight = Math.max(...this.columnHeights);

    return {
      width: this.boundedSize,
      height: maxHeight,
    };
  }

  /**
   * Recomputes layouts for items in the given range.
   * Uses different placement strategies based on optimization settings.
   * @param startIndex Starting index of items to recompute
   * @param endIndex Ending index of items to recompute
   */
  recomputeLayouts(startIndex: number, endIndex: number): void {
    // Reset column heights if starting from the beginning
    if (startIndex === 0) {
      this.columnHeights = Array(this.maxColumns).fill(0);
      this.currentColumn = 0;
    } else {
      // Find the y-position of the first item to recompute
      // and adjust column heights accordingly
      this.updateColumnHeightsToIndex(startIndex);
    }

    const itemCount = this.layouts.length;

    for (let i = startIndex; i < itemCount; i++) {
      const layout = this.getLayout(i);
      // Skip tracking span because we're not changing widths
      const span = this.getSpan(i, true);

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

  /**
   * Calculates the width of an item based on its span.
   * @param index Index of the item
   * @returns Width of the item
   */
  private getWidth(index: number): number {
    return (this.boundedSize / this.maxColumns) * this.getSpan(index);
  }

  private updateAllWidths() {
    for (let i = 0; i < this.layouts.length; i++) {
      this.layouts[i].width = this.getWidth(i);
      this.layouts[i].minHeight = undefined;
    }
  }

  /**
   * Places an item sequentially in the next available position.
   * @param layout Layout information for the item
   * @param span Number of columns the item spans
   */
  private placeItemSequentially(layout: RVLayout, span: number): void {
    // Check if the item can fit in the current row
    if (this.currentColumn + span > this.maxColumns) {
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
      if (col < this.maxColumns) {
        maxHeight = Math.max(maxHeight, this.columnHeights[col]);
      }
    }

    // Place the item
    layout.x = (this.boundedSize / this.maxColumns) * this.currentColumn;
    layout.y = maxHeight;

    // Update column heights
    for (let col = this.currentColumn; col < this.currentColumn + span; col++) {
      if (col < this.maxColumns) {
        this.columnHeights[col] = maxHeight + layout.height;
      }
    }

    // Move to the next column
    this.currentColumn += span;
    if (this.currentColumn >= this.maxColumns) {
      this.currentColumn = 0;
    }
  }

  /**
   * Places a single-column item in the shortest available column.
   * @param layout Layout information for the item
   */
  private placeSingleColumnItem(layout: RVLayout): void {
    // Find the shortest column
    let shortestColumnIndex = 0;
    let minHeight = this.columnHeights[0];

    for (let i = 1; i < this.maxColumns; i++) {
      if (this.columnHeights[i] < minHeight) {
        minHeight = this.columnHeights[i];
        shortestColumnIndex = i;
      }
    }

    // Place the item in the shortest column
    layout.x = (this.boundedSize / this.maxColumns) * shortestColumnIndex;
    layout.y = this.columnHeights[shortestColumnIndex];

    // Update the column height
    this.columnHeights[shortestColumnIndex] += layout.height;
  }

  /**
   * Places a multi-column item in the position that minimizes total column heights.
   * @param layout Layout information for the item
   * @param span Number of columns the item spans
   */
  private placeOptimizedMultiColumnItem(layout: RVLayout, span: number): void {
    let bestStartColumn = 0;
    let minTotalHeight = Number.MAX_VALUE;

    // Try all possible positions
    for (let startCol = 0; startCol <= this.maxColumns - span; startCol++) {
      // Find the maximum height among the columns this item would span
      let maxHeight = this.columnHeights[startCol];
      for (let col = startCol + 1; col < startCol + span; col++) {
        maxHeight = Math.max(maxHeight, this.columnHeights[col]);
      }

      // Calculate the total height after placing the item
      let totalHeight = 0;
      for (let col = 0; col < this.maxColumns; col++) {
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
    layout.x = (this.boundedSize / this.maxColumns) * bestStartColumn;
    layout.y = maxHeight;

    // Update column heights
    for (let col = bestStartColumn; col < bestStartColumn + span; col++) {
      this.columnHeights[col] = maxHeight + layout.height;
    }
  }

  /**
   * Updates column heights up to a given index by recalculating item positions.
   * @param index Index to update column heights up to
   */
  private updateColumnHeightsToIndex(index: number): void {
    // Reset column heights
    this.columnHeights = Array(this.maxColumns).fill(0);
    this.currentColumn = 0;

    // Recalculate column heights up to the given index
    for (let i = 0; i < index; i++) {
      const layout = this.layouts[i];
      const itemWidth = layout.width;
      const columnWidth = this.boundedSize / this.maxColumns;
      const span = Math.round(itemWidth / columnWidth);

      // Find which columns this item spans
      const startColumn = Math.round(layout.x / columnWidth);
      const endColumn = Math.min(startColumn + span, this.maxColumns);

      // Update column heights
      for (let col = startColumn; col < endColumn; col++) {
        this.columnHeights[col] = Math.max(
          this.columnHeights[col],
          layout.y + layout.height
        );
      }

      // Update current column for non-optimized layout
      if (!this.optimizeItemArrangement) {
        this.currentColumn = (startColumn + span) % this.maxColumns;
      }
    }
  }
}
