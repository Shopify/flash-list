import {
  LayoutParams,
  RVDimension,
  RVLayout,
  RVLayoutInfo,
  RVLayoutManager,
} from "./LayoutManager";

/**
 * GridLayoutManager implementation that arranges items in a grid pattern.
 * Items are placed in rows and columns, with support for items spanning multiple columns.
 */
export class RVGridLayoutManagerImpl extends RVLayoutManager {
  /** The width of the bounded area for the grid */
  private boundedSize: number;

  /** If there's a span change for grid layout, we need to recompute all the widths */
  private fullRelayoutRequired = false;

  constructor(params: LayoutParams, previousLayoutManager?: RVLayoutManager) {
    super(params, previousLayoutManager);
    this.boundedSize = params.windowSize.width;
  }

  /**
   * Updates layout parameters and triggers recomputation if necessary.
   * @param params New layout parameters
   */
  updateLayoutParams(params: LayoutParams): void {
    const prevNumColumns = this.maxColumns;
    super.updateLayoutParams(params);
    if (
      this.boundedSize !== params.windowSize.width ||
      prevNumColumns !== params.maxColumns
    ) {
      this.boundedSize = params.windowSize.width;
      if (this.layouts.length > 0) {
        // update all widths
        this.updateAllWidths();

        this.recomputeLayouts(0, this.layouts.length - 1);
        this.requiresRepaint = true;
      }
    }
  }

  /**
   * Processes layout information for items, updating their dimensions.
   * @param layoutInfo Array of layout information for items
   * @param itemCount Total number of items in the list
   */
  processLayoutInfo(layoutInfo: RVLayoutInfo[], itemCount: number) {
    for (const info of layoutInfo) {
      const { index, dimensions } = info;
      const layout = this.layouts[index];
      layout.height = dimensions.height;
      layout.isHeightMeasured = true;
      layout.isWidthMeasured = true;
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
   * @param index Index of the item to estimate layout for
   */
  estimateLayout(index: number) {
    const layout = this.layouts[index];
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
    const totalHeight = this.computeTotalHeightTillRow(this.layouts.length - 1);
    return {
      width: this.boundedSize,
      height: totalHeight,
    };
  }

  /**
   * Recomputes layouts for items in the given range.
   * @param startIndex Starting index of items to recompute
   * @param endIndex Ending index of items to recompute
   */
  recomputeLayouts(startIndex: number, endIndex: number): void {
    const newStartIndex = this.locateFirstIndexInRow(
      Math.max(0, startIndex - 1)
    );
    const startVal = this.getLayout(newStartIndex);

    let startX = startVal.x;
    let startY = startVal.y;

    for (let i = newStartIndex; i <= endIndex; i++) {
      const layout = this.getLayout(i);
      if (!this.checkBounds(startX, layout.width)) {
        const tallestItem = this.processAndReturnTallestItemInRow(i - 1);
        startY = tallestItem.y + tallestItem.height;
        startX = 0;
      }

      layout.x = startX;
      layout.y = startY;
      startX += layout.width;
    }
    if (endIndex === this.layouts.length - 1) {
      this.processAndReturnTallestItemInRow(endIndex);
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

  /**
   * Processes items in a row and returns the tallest item.
   * Also handles height normalization for items in the same row.
   * Tallest item per row helps in forcing tallest items height on neighbouring items.
   * @param endIndex Index of the last item in the row
   * @returns The tallest item in the row
   */
  private processAndReturnTallestItemInRow(endIndex: number): RVLayout {
    const startIndex = this.locateFirstIndexInRow(endIndex);
    let tallestItem: RVLayout | undefined;
    let maxHeight = 0;
    let i = startIndex;
    let isMeasured = false;
    while (i <= endIndex) {
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
    if (!tallestItem && maxHeight > 0) {
      maxHeight = Number.MAX_SAFE_INTEGER;
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
      while (i <= endIndex) {
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

  /**
   * Computes the total height of the layout.
   * @param endIndex Index of the last item in the row
   * @returns Total height of the layout
   */
  private computeTotalHeightTillRow(endIndex: number): number {
    const startIndex = this.locateFirstIndexInRow(endIndex);
    const y = this.layouts[startIndex].y;
    let maxHeight = 0;
    let i = startIndex;
    while (i <= endIndex) {
      maxHeight = Math.max(maxHeight, this.layouts[i].height);
      i++;
      if (i >= this.layouts.length) {
        break;
      }
    }
    return y + maxHeight;
  }

  private updateAllWidths() {
    for (let i = 0; i < this.layouts.length; i++) {
      this.layouts[i].width = this.getWidth(i);
    }
  }

  /**
   * Checks if an item can fit within the bounded width.
   * @param itemX Starting X position of the item
   * @param width Width of the item
   * @returns True if the item fits within bounds
   */
  private checkBounds(itemX: number, width: number): boolean {
    return itemX + width <= this.boundedSize + 0.9;
  }

  /**
   * Locates the index of the first item in the current row.
   * @param itemIndex Index to start searching from
   * @returns Index of the first item in the row
   */
  private locateFirstIndexInRow(itemIndex: number): number {
    if (itemIndex === 0) {
      return 0;
    }
    let i = itemIndex;
    for (; i >= 0; i--) {
      if (this.layouts[i].x === 0) {
        break;
      }
    }
    return Math.max(i, 0);
  }
}
