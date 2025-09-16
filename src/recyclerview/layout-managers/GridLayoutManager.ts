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

  /** Cache of the last row start index to optimize separator updates */
  private lastRowStartIndex = -1;

  /** Cached column width to avoid repeated division operations */
  private cachedColumnWidth = 0;

  constructor(params: LayoutParams, previousLayoutManager?: RVLayoutManager) {
    super(params, previousLayoutManager);
    this.boundedSize = params.windowSize.width;
    this.cachedColumnWidth = this.boundedSize / this.maxColumns;
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
      this.cachedColumnWidth = this.boundedSize / this.maxColumns;
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

    // Only calculate width if not already measured or if forced recalculation is needed
    if (!layout.isWidthMeasured || !layout.enforcedWidth) {
      layout.width = this.getWidth(index);
      layout.isWidthMeasured = true;
      layout.enforcedWidth = true;
    }

    layout.height = this.getEstimatedHeight(index);
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

      // Ensure width is calculated for this specific item if needed
      if (!layout.isWidthMeasured || !layout.enforcedWidth) {
        layout.width = this.getWidth(i);
        layout.isWidthMeasured = true;
        layout.enforcedWidth = true;
      }

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
      this.markLastRowItemsToSkipSeparators(endIndex);
    }
  }

  /**
   * Calculates the width of an item based on its span.
   * @param index Index of the item
   * @returns Width of the item
   */
  private getWidth(index: number): number {
    return this.cachedColumnWidth * this.getSpan(index);
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
    const layoutsLength = this.layouts.length; // Cache length

    while (i <= endIndex && i < layoutsLength) {
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
      while (i <= endIndex && i < layoutsLength) {
        this.layouts[i].minHeight = targetHeight;
        if (targetHeight > 0) {
          this.layouts[i].height = targetHeight;
        }
        i++;
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
    const layoutsLength = this.layouts.length; // Cache length

    while (i <= endIndex && i < layoutsLength) {
      maxHeight = Math.max(maxHeight, this.layouts[i].height);
      i++;
    }
    return y + maxHeight;
  }

  private updateAllWidths() {
    const layoutsLength = this.layouts.length; // Cache length

    // Only reset skipSeparator for previously marked last row items
    if (this.lastRowStartIndex >= 0) {
      for (let i = this.lastRowStartIndex; i < layoutsLength; i++) {
        this.layouts[i].skipSeparator = false;
      }
    }

    // Mark all layouts as needing width recalculation instead of updating immediately
    // This defers the expensive width calculation until actually needed
    for (const layout of this.layouts) {
      layout.isWidthMeasured = false;
      layout.enforcedWidth = false;
    }

    // Mark new last row items to skip separators
    if (layoutsLength > 0) {
      this.markLastRowItemsToSkipSeparators(layoutsLength - 1);
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

  /**
   * Marks items in the last row to skip separators to prevent height stretching.
   * Only updates the previous and current last row items.
   * @param endIndex Index of the last item in the layout
   */
  private markLastRowItemsToSkipSeparators(endIndex: number): void {
    const newLastRowStartIndex = this.locateFirstIndexInRow(endIndex);

    const layoutsLength = this.layouts.length; // Cache length

    // Clear skipSeparator from previous last row if it changed
    if (
      this.lastRowStartIndex >= 0 &&
      this.lastRowStartIndex !== newLastRowStartIndex
    ) {
      const clearEnd = Math.min(layoutsLength, newLastRowStartIndex);
      for (let i = this.lastRowStartIndex; i < clearEnd; i++) {
        this.layouts[i].skipSeparator = false;
      }
    }

    // Mark new last row items to skip separators
    const markEnd = Math.min(endIndex + 1, layoutsLength);
    for (let i = newLastRowStartIndex; i < markEnd; i++) {
      this.layouts[i].skipSeparator = true;
    }

    // Update cached last row start index
    this.lastRowStartIndex = newLastRowStartIndex;
  }
}
