import { ConsecutiveNumbers } from "./ConsecutiveNumbers";
import { RVLayoutManager } from "../layout-managers/LayoutManager";

export interface RVEngagedIndicesTracker {
  // current scroll offset, setting this driectly will not trigger visible indices change
  scrollOffset: number;
  drawDistance: number;

  /**
   * Updates the scroll offset and calculates the new engaged indices.
   * @param offset - The new scroll offset.
   * @param velocity - The scroll velocity to determine buffer distribution.
   * @param layoutManager - The layout manager to fetch visible layouts.
   * @returns The new engaged indices if any or undefined if no change
   */
  updateScrollOffset: (
    offset: number,
    velocity: Velocity | null | undefined,
    layoutManager: RVLayoutManager
  ) => ConsecutiveNumbers | undefined;
  getEngagedIndices: () => ConsecutiveNumbers;
  computeVisibleIndices: (layoutManager: RVLayoutManager) => ConsecutiveNumbers;
}

export interface Velocity {
  x: number;
  y: number;
}

export class RVEngagedIndicesTrackerImpl implements RVEngagedIndicesTracker {
  // Current scroll offset
  public scrollOffset = 0;
  // Render ahead offset for pre-rendering items
  public drawDistance: number = 250;
  // Currently engaged indices (including render buffer)
  private engagedIndices = ConsecutiveNumbers.EMPTY;

  private smallMultiplier = 0.1;
  private largeMultiplier = 0.9;

  private velocityHistory = [-1, -1, -1, -1, -1];
  private velocityIndex = 0;

  /**
   * Updates the scroll offset and calculates the new engaged indices.
   * @param offset - The new scroll offset.
   * @param velocity - The scroll velocity to determine buffer distribution.
   * @param layoutManager - The layout manager to fetch visible layouts.
   * @returns The new engaged indices if any or undefined if no change
   */
  updateScrollOffset(
    offset: number,
    velocity: Velocity | null | undefined,
    layoutManager: RVLayoutManager
  ): ConsecutiveNumbers | undefined {
    // Update current scroll position
    this.scrollOffset = offset;

    console.log("updateScrollOffset", offset, velocity);

    // STEP 1: Determine the currently visible viewport
    const windowSize = layoutManager.getWindowsSize();
    const isHorizontal = layoutManager.isHorizontal();
    const viewportStart = offset;
    const viewportSize = isHorizontal ? windowSize.width : windowSize.height;
    const viewportEnd = viewportStart + viewportSize;

    // STEP 2: Determine buffer size and distribution
    // The total extra space where items will be pre-rendered
    const totalBuffer = this.drawDistance * 2;

    // Determine scroll direction to optimize buffer distribution
    const isScrollingBackward = this.isScrollingBackward(
      isHorizontal ? velocity?.x : velocity?.y
    );

    // Distribute more buffer in the direction of scrolling
    // When scrolling forward: more buffer after viewport
    // When scrolling backward: more buffer before viewport
    const beforeRatio = isScrollingBackward
      ? this.largeMultiplier
      : this.smallMultiplier;
    const afterRatio = isScrollingBackward
      ? this.smallMultiplier
      : this.largeMultiplier;

    let bufferBefore = Math.ceil(totalBuffer * beforeRatio);
    let bufferAfter = Math.ceil(totalBuffer * afterRatio);

    // STEP 3: Calculate the extended viewport (visible area + buffers)
    // The start position with buffer (never less than 0)
    let extendedStart = Math.max(0, viewportStart - bufferBefore);

    // If we couldn't apply full buffer at start, calculate how much was unused
    const unusedStartBuffer = Math.max(0, bufferBefore - viewportStart);

    // Add any unused start buffer to the end buffer
    let extendedEnd = viewportEnd + bufferAfter + unusedStartBuffer;

    // STEP 4: Handle end boundary adjustments
    // Get the total content size to check for end boundary
    const layoutSize = layoutManager.getLayoutSize();
    const maxPosition = isHorizontal ? layoutSize.width : layoutSize.height;

    // If we hit the end boundary, redistribute unused buffer to the start
    if (extendedEnd > maxPosition) {
      // Calculate unused end buffer and apply it to the start if possible
      const unusedEndBuffer = extendedEnd - maxPosition;
      extendedEnd = maxPosition;

      // Try to extend start position further with the unused end buffer
      extendedStart = Math.max(0, extendedStart - unusedEndBuffer);
    }

    // STEP 5: Get and return the new engaged indices
    const newEngagedIndices = layoutManager.getVisibleLayouts(
      extendedStart,
      extendedEnd
    );

    // Only return new indices if they've changed
    const oldEngagedIndices = this.engagedIndices;
    this.engagedIndices = newEngagedIndices;

    return newEngagedIndices.equals(oldEngagedIndices)
      ? undefined
      : newEngagedIndices;
  }

  private isScrollingBackward(velocity?: number): boolean {
    //update velocity history
    if (velocity) {
      this.velocityHistory[this.velocityIndex] = velocity;
      this.velocityIndex =
        (this.velocityIndex + 1) % this.velocityHistory.length;
    }
    //should decide based on whether we have more positive or negative values, use for loop
    let positiveCount = 0;
    let negativeCount = 0;
    for (let i = 0; i < this.velocityHistory.length; i++) {
      if (this.velocityHistory[i] > 0) {
        positiveCount++;
      } else if (this.velocityHistory[i] < 0) {
        negativeCount++;
      }
    }
    return positiveCount < negativeCount;
  }

  /**
   * Computes the currently visible indices. Not buffer is applied.
   * @param layoutManager - The layout manager to fetch visible layouts.
   * @returns The visible indices.
   */
  computeVisibleIndices(layoutManager: RVLayoutManager): ConsecutiveNumbers {
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
   * @returns The last computed engaged indices. Doesn't compute new.
   */
  getEngagedIndices(): ConsecutiveNumbers {
    return this.engagedIndices;
  }
}
