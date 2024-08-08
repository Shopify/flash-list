import { RVDimension, RVLayoutManager } from "./LayoutManager";

export interface RVViewabilityManager {
  updateScrollOffset: (offset: number, layoutManager: RVLayoutManager) => void;
  getVisibleIndices: () => number[];
  // can be used to get visible indices
  setOnVisibleIndicesChangedListener: (
    callback: (all: number[], now: number[], notNow: number[]) => void
  ) => void;
  // can be used to get indices that need to be rendered, includes render buffer
  setOnEngagedIndicesChangedListener: (
    callback: (all: number[], now: number[], notNow: number[]) => void
  ) => void;
  // get last updated offset
  getScrollOffset: () => number;
  // Adds render buffer, only impacts engaged indices
  updateRenderAheadOffset: (
    renderAheadOffset: number,
    layoutManager: RVLayoutManager,
    windowSize: RVDimension
  ) => void;
}

export class RVViewabilityManagerImpl implements RVViewabilityManager {
  // Current scroll offset
  private scrollOffset = 0;
  // Render ahead offset for pre-rendering items
  private renderAheadOffset = 250;
  // Currently visible indices
  private visibleIndices: number[] = [];
  // Currently engaged indices (including render buffer)
  private engagedIndices: number[] = [];
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
   * @param layoutManager - The layout manager to fetch visible layouts.
   * @param windowSize - The size of the visible window.
   */
  updateScrollOffset(offset: number, layoutManager: RVLayoutManager): void {
    this.scrollOffset = offset;
    const unboundStart = offset;
    const windowSize = layoutManager.getWindowsSize();
    const unboundEnd =
      offset +
      (layoutManager.isHorizontal() ? windowSize.width : windowSize.height);

    // Get new visible and engaged indices
    const newVisibleIndices = layoutManager.getVisibleLayouts(
      unboundStart,
      unboundEnd
    );
    const newEngagedIndices = layoutManager.getVisibleLayouts(
      Math.max(0, unboundStart - this.renderAheadOffset),
      unboundEnd + this.renderAheadOffset
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
   * Returns the current scroll offset.
   * @returns The current scroll offset.
   */
  getScrollOffset(): number {
    return this.scrollOffset;
  }

  /**
   * Updates the render ahead offset.
   * @param renderAheadOffset - The new render ahead offset.
   */
  updateRenderAheadOffset(
    renderAheadOffset: number,
    layoutManager: RVLayoutManager
  ): void {
    this.renderAheadOffset = renderAheadOffset;
    this.updateScrollOffset(this.scrollOffset, layoutManager);
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
