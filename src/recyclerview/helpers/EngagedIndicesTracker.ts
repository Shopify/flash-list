import { ConsecutiveNumbers } from "./ConsecutiveNumbers";
import { RVLayoutManager } from "../layout-managers/LayoutManager";

export interface RVEngagedIndicesTracker {
  // Current scroll offset of the list. Directly setting this won't trigger visible indices updates
  scrollOffset: number;
  // Total distance (in pixels) to pre-render items before and after the visible viewport
  drawDistance: number;

  /**
   * Updates the scroll offset and calculates which items should be rendered (engaged indices).
   * @param offset - The new scroll offset position
   * @param velocity - Current scroll velocity to optimize buffer distribution
   * @param layoutManager - Layout manager to fetch item positions and dimensions
   * @returns New engaged indices if changed, undefined if no change
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
  // Current scroll position of the list
  public scrollOffset = 0;
  // Distance to pre-render items before and after the visible viewport (in pixels)
  public drawDistance: number = 250;
  // Currently rendered item indices (including buffer items)
  private engagedIndices = ConsecutiveNumbers.EMPTY;

  // Buffer distribution multipliers for scroll direction optimization
  private smallMultiplier = 0.1; // Used for buffer in the opposite direction of scroll
  private largeMultiplier = 0.9; // Used for buffer in the direction of scroll

  // Circular buffer to track recent scroll velocities for direction detection
  private velocityHistory = [-1, -1, -1, -1, -1];
  private velocityIndex = 0;

  /**
   * Updates scroll position and determines which items should be rendered.
   * Implements a smart buffer system that:
   * 1. Calculates the visible viewport
   * 2. Determines optimal buffer distribution based on scroll direction
   * 3. Adjusts buffer sizes at list boundaries
   * 4. Returns new indices that need to be rendered
   */
  updateScrollOffset(
    offset: number,
    velocity: Velocity | null | undefined,
    layoutManager: RVLayoutManager
  ): ConsecutiveNumbers | undefined {
    // Update current scroll position
    this.scrollOffset = offset;

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

  /**
   * Determines scroll direction by analyzing recent velocity history.
   * Uses a majority voting system on the last 5 velocity values.
   * @param velocity - Current scroll velocity component (x or y)
   * @returns true if scrolling backward (negative direction), false otherwise
   */
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
   * Calculates which items are currently visible in the viewport.
   * Unlike getEngagedIndices, this doesn't include buffer items.
   * @param layoutManager - Layout manager to fetch item positions
   * @returns Indices of items currently visible in the viewport
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
   * Returns the currently engaged (rendered) indices.
   * This includes both visible items and buffer items.
   * @returns The last computed set of engaged indices
   */
  getEngagedIndices(): ConsecutiveNumbers {
    return this.engagedIndices;
  }
}
