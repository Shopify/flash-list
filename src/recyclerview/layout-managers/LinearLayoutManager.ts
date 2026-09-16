import {
  LayoutParams,
  RVDimension,
  RVLayoutInfo,
  RVLayout,
  RVLayoutManager,
} from "./LayoutManager";

/**
 * LinearLayoutManager implementation that arranges items in a single row or column.
 * Supports both horizontal and vertical layouts with dynamic item sizing.
 */
export class RVLinearLayoutManagerImpl extends RVLayoutManager {
  /** The bounded size (width for vertical, height for horizontal) */
  private boundedSize: number;
  /** Whether the bounded size has been set */
  private hasSize = false;

  /** Reference to the tallest item in the layout */
  private tallestItem?: RVLayout;
  /** Height of the tallest item */
  private tallestItemHeight = 0;

  /**
   * Rolling history (most recent last) of raw incoming bounded-size values,
   * used to detect a web scrollbar show/hide feedback loop before it is
   * "locked". Cleared once a real (non-oscillating) resize is observed.
   */
  private boundedSizeHistory: number[] = [];
  /**
   * When set, boundedSize is pinned to this value because an oscillation was
   * detected. Incoming sizes within SCROLLBAR_OSCILLATION_THRESHOLD of this
   * value are treated as scrollbar noise and ignored; a larger delta is
   * treated as a genuine resize and clears the lock.
   */
  private lockedBoundedSize?: number;
  /**
   * Max cross-axis delta (px) treated as scrollbar-induced noise rather than
   * a real resize. Classic (non-overlay) scrollbars are typically 15-17px
   * wide; 20px gives a small margin without masking real resizes.
   */
  private static readonly SCROLLBAR_OSCILLATION_THRESHOLD = 20;

  constructor(params: LayoutParams, previousLayoutManager?: RVLayoutManager) {
    super(params, previousLayoutManager);
    this.boundedSize = this.horizontal
      ? params.windowSize.height
      : params.windowSize.width;
    this.hasSize = this.boundedSize > 0;
  }

  /**
   * Updates layout parameters and triggers recomputation if necessary.
   *
   * On web with classic (non-overlay) scrollbars, showing/hiding the
   * scrollbar changes the measured cross-axis size by its width, which can
   * flip content between "fits" and "overflows" and re-trigger the
   * scrollbar - an infinite show/hide/relayout loop (issue #2334). To break
   * that loop we detect an A/B/A bounce within a small threshold and lock
   * boundedSize until a genuinely larger change arrives.
   * @param params New layout parameters
   */
  updateLayoutParams(params: LayoutParams): void {
    const prevHorizontal = this.horizontal;
    super.updateLayoutParams(params);
    const oldBoundedSize = this.boundedSize;
    const incomingBoundedSize = this.horizontal
      ? params.windowSize.height
      : params.windowSize.width;

    if (prevHorizontal !== this.horizontal) {
      // Axis changed: bounded size now means something different, so any
      // in-progress oscillation tracking no longer applies.
      this.lockedBoundedSize = undefined;
      this.boundedSizeHistory = [];
    }

    this.boundedSize = this.resolveBoundedSize(incomingBoundedSize);

    if (
      oldBoundedSize !== this.boundedSize ||
      prevHorizontal !== this.horizontal
    ) {
      if (this.layouts.length > 0) {
        // console.log("-----> recomputeLayouts", this.horizontal);
        this.recomputeLayouts(0, this.layouts.length - 1);
        this.requiresRepaint = true;
      }
    }
  }

  /**
   * Resolves the bounded size to use for this update, applying scrollbar
   * oscillation detection/locking. See updateLayoutParams for context.
   * @param incomingBoundedSize Raw bounded size derived from this update's params
   */
  private resolveBoundedSize(incomingBoundedSize: number): number {
    const threshold = RVLinearLayoutManagerImpl.SCROLLBAR_OSCILLATION_THRESHOLD;

    if (this.lockedBoundedSize !== undefined) {
      if (Math.abs(incomingBoundedSize - this.lockedBoundedSize) <= threshold) {
        // Scrollbar noise while locked - ignore, stay pinned.
        return this.lockedBoundedSize;
      }
      // Large enough to be a genuine resize - unlock and re-baseline.
      this.lockedBoundedSize = undefined;
      this.boundedSizeHistory = [];
    }

    this.boundedSizeHistory.push(incomingBoundedSize);
    if (this.boundedSizeHistory.length > 3) {
      this.boundedSizeHistory.shift();
    }

    const [first, second, third] = this.boundedSizeHistory;
    const isOscillating =
      this.boundedSizeHistory.length === 3 &&
      first === third &&
      first !== second &&
      Math.abs(first - second) <= threshold;

    if (isOscillating) {
      this.lockedBoundedSize = first;
      return first;
    }

    return incomingBoundedSize;
  }

  /**
   * Processes layout information for items, updating their dimensions.
   * For horizontal layouts, also normalizes heights of items.
   * @param layoutInfo Array of layout information for items
   * @param itemCount Total number of items in the list
   */
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

    if (this.horizontal && !this.hasSize) {
      this.normalizeLayoutHeights(layoutInfo);
    }
  }

  /**
   * Estimates layout dimensions for an item at the given index.
   * @param index Index of the item to estimate layout for
   */
  estimateLayout(index: number) {
    const layout = this.layouts[index];
    layout.width = this.horizontal
      ? this.getEstimatedWidth(index)
      : this.boundedSize;
    layout.height = this.getEstimatedHeight(index);
    layout.isWidthMeasured = !this.horizontal;
    layout.enforcedWidth = !this.horizontal;
  }

  /**
   * Returns the total size of the layout area.
   * @returns RVDimension containing width and height of the layout
   */
  getLayoutSize(): RVDimension {
    if (this.layouts.length === 0) return { width: 0, height: 0 };
    const lastLayout = this.layouts[this.layouts.length - 1];
    return {
      width: this.horizontal
        ? lastLayout.x + lastLayout.width
        : this.boundedSize,
      height: this.horizontal
        ? this.tallestItem?.height ?? this.boundedSize
        : lastLayout.y + lastLayout.height,
    };
  }

  /**
   * Normalizes heights of items in horizontal layout to match the tallest item.
   * @param layoutInfo Array of layout information for items
   */
  private normalizeLayoutHeights(layoutInfo: RVLayoutInfo[]) {
    let newTallestItem: RVLayout | undefined;
    for (const info of layoutInfo) {
      const { index } = info;
      const layout = this.layouts[index];
      if (
        layout.height > (layout.minHeight ?? 0) &&
        layout.height > (newTallestItem?.height ?? 0)
      ) {
        newTallestItem = layout;
      }
    }
    if (newTallestItem && newTallestItem.height !== this.tallestItemHeight) {
      let targetMinHeight = newTallestItem.height;
      if (newTallestItem.height < this.tallestItemHeight) {
        this.requiresRepaint = true;
        targetMinHeight = 0;
      }
      // set minHeight for all layouts
      for (const layout of this.layouts) {
        if (targetMinHeight > 0) {
          layout.height = newTallestItem.height;
        }
        layout.minHeight = targetMinHeight;
      }
      newTallestItem.minHeight = 0;
      this.tallestItem = newTallestItem;
      this.tallestItemHeight = newTallestItem.height;
    }
  }

  /**
   * Recomputes layouts for items in the given range.
   * Positions items sequentially based on layout direction.
   * @param startIndex Starting index of items to recompute
   * @param endIndex Ending index of items to recompute
   */
  recomputeLayouts(startIndex: number, endIndex: number): void {
    for (let i = startIndex; i <= endIndex; i++) {
      const layout = this.getLayout(i);

      // Set positions based on whether this is the first item or not
      if (i === 0) {
        layout.x = 0;
        layout.y = 0;
      } else {
        const prevLayout = this.getLayout(i - 1);
        layout.x = this.horizontal ? prevLayout.x + prevLayout.width : 0;
        layout.y = this.horizontal ? 0 : prevLayout.y + prevLayout.height;
      }

      // Set width for vertical layouts
      if (!this.horizontal) {
        layout.width = this.boundedSize;
      } else if (this.hasSize) {
        layout.minHeight = this.boundedSize;
      }
    }
  }
}
