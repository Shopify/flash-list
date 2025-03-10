import { RVLayoutManager } from "./layout-managers/LayoutManager";

export interface RVViewabilityManager {
  // current scroll offset, setting this driectly will not trigger visible indices change
  scrollOffset: number;
  updateScrollOffset: (
    offset: number,
    velocity: Velocity | null | undefined,
    layoutManager: RVLayoutManager
  ) => void;
  getVisibleIndices: () => number[];
  // can be used to get visible indices
  setOnVisibleIndicesChangedListener: (
    callback: (all: number[], now: number[], notNow: number[]) => void
  ) => void;
  // can be used to get indices that need to be rendered, includes render buffer
  setOnEngagedIndicesChangedListener: (
    callback: (all: number[], now: number[], notNow: number[]) => void
  ) => void;
  // Adds render buffer, only impacts engaged indices
  updateRenderAheadOffset: (
    renderAheadOffset: number,
    layoutManager: RVLayoutManager
  ) => void;
}

export interface Velocity {
  x: number;
  y: number;
}

export class RVViewabilityManagerImpl implements RVViewabilityManager {
  // Current scroll offset
  public scrollOffset = 0;
  // Render ahead offset for pre-rendering items
  private renderAheadOffset: number | undefined = undefined;

  // Currently visible indices
  private visibleIndices: number[] = [];
  // Currently engaged indices (including render buffer)
  private engagedIndices: number[] = [];

  private isScrollingBackward = false;

  private smallMultiplier = 0.1;
  private largeMultiplier = 0.9;

  // Callback for visible indices change
  private onVisibleIndicesChanged?: (
    all: number[],
    now: number[],
    notNow: number[]
  ) => void;

  // Callback for engaged indices change
  private onEngagedIndicesChanged?: (
    all: number[],
    now: number[],
    notNow: number[]
  ) => void;

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
    const newVisibleIndices = layoutManager.getVisibleLayouts(
      viewportStart,
      viewportEnd
    );

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
   * @returns An array of visible indices.
   */
  getVisibleIndices(): number[] {
    return [...this.visibleIndices];
  }

  /**
   * Sets the callback for when visible indices change.
   * @param callback - The callback function.
   */
  setOnVisibleIndicesChangedListener(
    callback: (all: number[], now: number[], notNow: number[]) => void
  ): void {
    this.onVisibleIndicesChanged = callback;
  }

  /**
   * Sets the callback for when engaged indices change.
   * @param callback - The callback function.
   */
  setOnEngagedIndicesChangedListener(
    callback: (all: number[], now: number[], notNow: number[]) => void
  ): void {
    this.onEngagedIndicesChanged = callback;
  }

  /**
   * Updates the render ahead offset.
   * @param renderAheadOffset - The new render ahead offset.
   * @param layoutManager - The layout manager to fetch visible layouts.
   */
  updateRenderAheadOffset(
    renderAheadOffset: number,
    layoutManager: RVLayoutManager
  ): void {
    this.renderAheadOffset = renderAheadOffset;
    this.updateScrollOffset(this.scrollOffset, null, layoutManager);
  }

  /**
   * Updates the visible and engaged indices and triggers the respective callbacks.
   * @param newVisibleIndices - The new visible indices.
   * @param newEngagedIndices - The new engaged indices.
   */
  private updateIndices(
    newVisibleIndices: number[],
    newEngagedIndices: number[]
  ): void {
    const oldVisibleIndices = this.visibleIndices;
    const oldEngagedIndices = this.engagedIndices;

    // Update the current visible and engaged indices
    this.visibleIndices = newVisibleIndices;
    this.engagedIndices = newEngagedIndices;

    // Trigger the visible indices changed callback if set and if there is a change
    if (
      this.onVisibleIndicesChanged &&
      !this.arraysEqual(newVisibleIndices, oldVisibleIndices)
    ) {
      const nowVisible = newVisibleIndices.filter(
        (index) => !oldVisibleIndices.includes(index)
      );
      const notNowVisible = oldVisibleIndices.filter(
        (index) => !newVisibleIndices.includes(index)
      );
      this.onVisibleIndicesChanged(
        newVisibleIndices,
        nowVisible,
        notNowVisible
      );
    }

    // Trigger the engaged indices changed callback if set and if there is a change
    if (
      this.onEngagedIndicesChanged &&
      !this.arraysEqual(newEngagedIndices, oldEngagedIndices)
    ) {
      const nowEngaged = newEngagedIndices.filter(
        (index) => !oldEngagedIndices.includes(index)
      );
      const notNowEngaged = oldEngagedIndices.filter(
        (index) => !newEngagedIndices.includes(index)
      );
      this.onEngagedIndicesChanged(
        newEngagedIndices,
        nowEngaged,
        notNowEngaged
      );
    }
  }

  /**
   * Helper function to check if two arrays are equal.
   * @param arr1 - The first array.
   * @param arr2 - The second array.
   * @returns True if the arrays are equal, false otherwise.
   */
  private arraysEqual(arr1: number[], arr2: number[]): boolean {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
  }
}
