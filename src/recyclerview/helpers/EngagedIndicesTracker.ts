import { PlatformConfig } from "../../native/config/PlatformHelper";
import { RVLayoutManager } from "../layout-managers/LayoutManager";

import { ConsecutiveNumbers } from "./ConsecutiveNumbers";

export interface RVEngagedIndicesTracker {
  // Current scroll offset of the list. Directly setting this won't trigger visible indices updates
  scrollOffset: number;
  // Total distance (in pixels) to pre-render items before and after the visible viewport
  drawDistance: number;
  // Whether to use offset projection to predict the next scroll offset
  enableOffsetProjection: boolean;
  // Average render time of the list
  averageRenderTime: number;

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

  /**
   * Returns the currently engaged (rendered) indices.
   * This includes both visible items and buffer items.
   * @returns The last computed set of engaged indices
   */
  getEngagedIndices: () => ConsecutiveNumbers;

  /**
   * Computes the visible indices in the viewport.
   * @param layoutManager - Layout manager to fetch item positions and dimensions
   * @returns Indices of items currently visible in the viewport
   */
  computeVisibleIndices: (layoutManager: RVLayoutManager) => ConsecutiveNumbers;

  /**
   * Sets the scroll direction for velocity history tracking.
   * @param scrollDirection - The direction of scrolling ("forward" or "backward")
   */
  setScrollDirection: (scrollDirection: "forward" | "backward") => void;

  /**
   * Resets the velocity history based on the current scroll direction.
   */
  resetVelocityHistory: () => void;
}

export interface Velocity {
  x: number;
  y: number;
}

export class RVEngagedIndicesTrackerImpl implements RVEngagedIndicesTracker {
  // Current scroll position of the list
  public scrollOffset = 0;
  // Distance to pre-render items before and after the visible viewport (in pixels)
  public drawDistance = PlatformConfig.defaultDrawDistance;

  // Whether to use offset projection to predict the next scroll offset
  public enableOffsetProjection = true;

  // Average render time of the list
  public averageRenderTime = 16;

  // Internal override to disable offset projection
  private forceDisableOffsetProjection = false;

  // Currently rendered item indices (including buffer items)
  private engagedIndices = ConsecutiveNumbers.EMPTY;

  // Buffer distribution multipliers for scroll direction optimization
  private smallMultiplier = 0.3; // Used for buffer in the opposite direction of scroll
  private largeMultiplier = 0.7; // Used for buffer in the direction of scroll

  // Circular buffer to track recent scroll velocities for direction detection
  private velocityHistory = [0, 0, 0, -0.1, -0.1];
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

    // Update velocity history
    if (velocity) {
      this.updateVelocityHistory(isHorizontal ? velocity.x : velocity.y);
    }

    // Determine scroll direction to optimize buffer distribution
    const isScrollingBackward = this.isScrollingBackward();
    const viewportStart =
      this.enableOffsetProjection && !this.forceDisableOffsetProjection
        ? this.getProjectedScrollOffset(offset, this.averageRenderTime)
        : offset;

    // console.log("timeMs", this.averageRenderTime, offset, viewportStart);

    const viewportSize = isHorizontal ? windowSize.width : windowSize.height;
    const viewportEnd = viewportStart + viewportSize;

    // STEP 2: Determine buffer size and distribution
    // The total extra space where items will be pre-rendered
    const totalBuffer = this.drawDistance * 2;

    // Distribute more buffer in the direction of scrolling
    // When scrolling forward: more buffer after viewport
    // When scrolling backward: more buffer before viewport
    const beforeRatio = isScrollingBackward
      ? this.largeMultiplier
      : this.smallMultiplier;
    const afterRatio = isScrollingBackward
      ? this.smallMultiplier
      : this.largeMultiplier;

    const bufferBefore = Math.ceil(totalBuffer * beforeRatio);
    const bufferAfter = Math.ceil(totalBuffer * afterRatio);

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
    // console.log(
    //   "newEngagedIndices",
    //   newEngagedIndices,
    //   this.scrollOffset,
    //   viewportStart
    // );
    // Only return new indices if they've changed
    const oldEngagedIndices = this.engagedIndices;
    this.engagedIndices = newEngagedIndices;

    return newEngagedIndices.equals(oldEngagedIndices)
      ? undefined
      : newEngagedIndices;
  }

  /**
   * Updates the velocity history with a new velocity value.
   * @param velocity - Current scroll velocity component (x or y)
   */
  private updateVelocityHistory(velocity: number) {
    this.velocityHistory[this.velocityIndex] = velocity;
    this.velocityIndex = (this.velocityIndex + 1) % this.velocityHistory.length;
  }

  /**
   * Determines scroll direction by analyzing recent velocity history.
   * Uses a majority voting system on the last 5 velocity values.
   * @returns true if scrolling backward (negative direction), false otherwise
   */
  private isScrollingBackward(): boolean {
    // should decide based on whether we have more positive or negative values, use for loop
    let positiveCount = 0;
    let negativeCount = 0;
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
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
   * Calculates the median velocity based on velocity history
   * Medina works better agains outliers
   * @returns Median velocity over the recent history
   */
  private getMedianVelocity(): number {
    // Make a copy of velocity history and sort it
    const sortedVelocities = [...this.velocityHistory].sort(
      (valueA, valueB) => valueA - valueB
    );
    const length = sortedVelocities.length;

    // If length is odd, return the middle element
    if (length % 2 === 1) {
      return sortedVelocities[Math.floor(length / 2)];
    }

    // If length is even, return the average of the two middle elements
    const midIndex = length / 2;
    return (sortedVelocities[midIndex - 1] + sortedVelocities[midIndex]) / 2;
  }

  /**
   * Projects the next scroll offset based on median velocity
   * @param timeMs Time in milliseconds to predict ahead
   * @returns Projected scroll offset
   */
  private getProjectedScrollOffset(offset: number, timeMs: number): number {
    const medianVelocity = this.getMedianVelocity();
    // Convert time from ms to seconds for velocity calculation
    // Predict next position: current position + (velocity * time)
    return offset + medianVelocity * timeMs;
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

  setScrollDirection(scrollDirection: "forward" | "backward") {
    if (scrollDirection === "forward") {
      this.velocityHistory = [0, 0, 0, 0.1, 0.1];
      this.velocityIndex = 0;
    } else {
      this.velocityHistory = [0, 0, 0, -0.1, -0.1];
      this.velocityIndex = 0;
    }
  }

  /**
   * Resets the velocity history based on the current scroll direction.
   * This ensures that the velocity history is always in sync with the current scroll direction.
   */
  resetVelocityHistory() {
    if (this.isScrollingBackward()) {
      this.setScrollDirection("backward");
    } else {
      this.setScrollDirection("forward");
    }
  }
}
