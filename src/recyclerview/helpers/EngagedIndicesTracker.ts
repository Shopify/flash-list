import { ConsecutiveNumbers } from "./ConsecutiveNumbers";
import { RVLayoutManager } from "../layout-managers/LayoutManager";

export interface RVEngagedIndicesTracker {
  // current scroll offset, setting this driectly will not trigger visible indices change
  scrollOffset: number;
  drawDistance: number | undefined;

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
  public drawDistance: number | undefined = undefined;
  // Currently engaged indices (including render buffer)
  private engagedIndices = ConsecutiveNumbers.EMPTY;

  private isScrollingBackward = false;

  private smallMultiplier = 0.1;
  private largeMultiplier = 0.9;

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
  ): ConsecutiveNumbers | undefined {
    this.scrollOffset = offset;
    const windowSize = layoutManager.getWindowsSize();
    const isHorizontal = layoutManager.isHorizontal();

    // Calculate viewport boundaries
    const viewportStart = offset;
    const viewportSize = isHorizontal ? windowSize.width : windowSize.height;
    const viewportEnd = viewportStart + viewportSize;

    // Calculate render-ahead buffers based on scroll direction
    const totalBuffer = this.drawDistance ?? viewportSize;

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

    const oldEngagedIndices = this.engagedIndices;
    this.engagedIndices = newEngagedIndices;

    if (!newEngagedIndices.equals(oldEngagedIndices)) {
      return newEngagedIndices;
    }
    return undefined;
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
