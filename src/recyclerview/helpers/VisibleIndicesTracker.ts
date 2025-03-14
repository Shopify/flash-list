import { ConsecutiveNumbers } from "./ConsecutiveNumbers";
import { RVLayoutManager } from "../layout-managers/LayoutManager";

export interface RVVisibleIndicesTracker {
  // current scroll offset, setting this driectly will not trigger visible indices change
  scrollOffset: number;
  renderAheadOffset: number | undefined;
  updateScrollOffset: (
    offset: number,
    velocity: Velocity | null | undefined,
    layoutManager: RVLayoutManager
  ) => void;
  getVisibleIndices: (layoutManager: RVLayoutManager) => ConsecutiveNumbers;
  // can be used to get visible indices
  setOnVisibleIndicesChangedListener: (
    callback: (all: ConsecutiveNumbers) => void
  ) => void;
  // can be used to get indices that need to be rendered, includes render buffer
  setOnEngagedIndicesChangedListener: (
    callback: (all: ConsecutiveNumbers) => void
  ) => void;
}

export interface Velocity {
  x: number;
  y: number;
}

export class RVVisibleIndicesTrackerImpl implements RVVisibleIndicesTracker {
  // Current scroll offset
  public scrollOffset = 0;
  // Render ahead offset for pre-rendering items
  public renderAheadOffset: number | undefined = undefined;

  // Currently visible indices
  private visibleIndices = ConsecutiveNumbers.EMPTY;
  // Currently engaged indices (including render buffer)
  private engagedIndices = ConsecutiveNumbers.EMPTY;

  private isScrollingBackward = false;

  private smallMultiplier = 0.1;
  private largeMultiplier = 0.9;

  // Callback for visible indices change
  private onVisibleIndicesChanged?: (all: ConsecutiveNumbers) => void;

  // Callback for engaged indices change
  private onEngagedIndicesChanged?: (all: ConsecutiveNumbers) => void;

  /**
   * Updates the scroll offset and calculates the new visible and engaged indices.
   * @param offset - The new scroll offset.
   * @param velocity - The scroll velocity to determine buffer distribution.
   * @param layoutManager - The layout manager to fetch visible layouts.
   */
  updateScrollOffset(
    offset: number,
    velocity: Velocity | null | undefined,
    layoutManager: RVLayoutManager
  ): void {
    this.scrollOffset = offset;
    const windowSize = layoutManager.getWindowsSize();
    const isHorizontal = layoutManager.isHorizontal();

    // Calculate viewport boundaries
    const viewportStart = offset;
    const viewportSize = isHorizontal ? windowSize.width : windowSize.height;
    const viewportEnd = viewportStart + viewportSize;

    // Get indices of items currently visible in the viewport
    const newVisibleIndices = this.getVisibleIndices(layoutManager);

    // Calculate render-ahead buffers based on scroll direction
    const totalBuffer = this.renderAheadOffset ?? viewportSize;

    // Default distribution: 25% before visible area, 75% after
    let bufferBefore = Math.ceil(totalBuffer * this.smallMultiplier);
    let bufferAfter = Math.ceil(totalBuffer * this.largeMultiplier);

    if (velocity) {
      // If scrolling backward, flip the buffer distribution
      this.isScrollingBackward =
        (isHorizontal && velocity.x < 0) || (!isHorizontal && velocity.y < 0);
    }

    if (this.isScrollingBackward) {
      bufferBefore = Math.ceil(totalBuffer * this.largeMultiplier);
      bufferAfter = Math.ceil(totalBuffer * this.smallMultiplier);
    }

    // Calculate the extended viewport with buffers
    const extendedStart = Math.max(0, viewportStart - bufferBefore);
    // Adjust bufferAfter if we couldn't apply full bufferBefore due to reaching start boundary
    //TODO: Check distanceFromWindow condition
    const startBoundaryAdjustment = Math.min(0, viewportStart - bufferBefore);
    const extendedEnd = viewportEnd + bufferAfter - startBoundaryAdjustment;
    // Get indices of items that should be rendered (visible + buffer areas)
    const newEngagedIndices = layoutManager.getVisibleLayouts(
      extendedStart,
      extendedEnd
    );

    // Update indices and trigger callbacks if necessary
    this.updateIndices(newVisibleIndices, newEngagedIndices);
  }

  /**
   * Returns the currently visible indices.
   * Does not update internal state
   * @returns An array of visible indices.
   */
  getVisibleIndices(layoutManager: RVLayoutManager): ConsecutiveNumbers {
    const windowSize = layoutManager.getWindowsSize();
    const isHorizontal = layoutManager.isHorizontal();

    // Calculate viewport boundaries
    const viewportStart = this.scrollOffset;
    const viewportSize = isHorizontal ? windowSize.width : windowSize.height;
    const viewportEnd = viewportStart + viewportSize;

    // Get indices of items currently visible in the viewport
    const newVisibleIndices = layoutManager.getVisibleLayouts(
      viewportStart,
      viewportEnd
    );
    return newVisibleIndices;
  }

  /**
   * Sets the callback for when visible indices change.
   * @param callback - The callback function.
   */
  setOnVisibleIndicesChangedListener(
    callback: (all: ConsecutiveNumbers) => void
  ): void {
    this.onVisibleIndicesChanged = callback;
  }

  /**
   * Sets the callback for when engaged indices change.
   * @param callback - The callback function.
   */
  setOnEngagedIndicesChangedListener(
    callback: (all: ConsecutiveNumbers) => void
  ): void {
    this.onEngagedIndicesChanged = callback;
  }

  /**
   * Updates the visible and engaged indices and triggers the respective callbacks.
   * TODO: Optimize this given arrays are already sorted
   * @param newVisibleIndices - The new visible indices.
   * @param newEngagedIndices - The new engaged indices.
   */
  private updateIndices(
    newVisibleIndices: ConsecutiveNumbers,
    newEngagedIndices: ConsecutiveNumbers
  ): void {
    const oldVisibleIndices = this.visibleIndices;
    const oldEngagedIndices = this.engagedIndices;

    // Update the current visible and engaged indices
    this.visibleIndices = newVisibleIndices;
    this.engagedIndices = newEngagedIndices;

    // Trigger the visible indices changed callback if set and if there is a change
    if (
      this.onVisibleIndicesChanged &&
      !newVisibleIndices.equals(oldVisibleIndices)
    ) {
      this.onVisibleIndicesChanged(newVisibleIndices);
    }

    // Trigger the engaged indices changed callback if set and if there is a change
    if (
      this.onEngagedIndicesChanged &&
      !newEngagedIndices.equals(oldEngagedIndices)
    ) {
      this.onEngagedIndicesChanged(newEngagedIndices);
    }
  }
}
