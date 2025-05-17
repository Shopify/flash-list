/**
 * Tracks and calculates velocity for scroll/drag movements
 * Used to determine momentum scrolling behavior
 */
export class VelocityTracker<T> {
  /** Timestamp of the last velocity update */
  private lastUpdateTime = Date.now();
  /** Current velocity vector with x and y components */
  private velocity = { x: 0, y: 0 };

  /** Reference to the momentum end timeout */
  private timeoutId: NodeJS.Timeout | null = null;

  /**
   * Calculates velocity based on position change over time
   * @param newOffset Current position value
   * @param oldOffset Previous position value
   * @param isHorizontal Whether movement is horizontal (true) or vertical (false)
   * @param isRTL Whether layout direction is right-to-left
   * @param callback Function to call with velocity updates and momentum end signal
   */
  computeVelocity(
    newOffset: number,
    oldOffset: number,
    isHorizontal: boolean,
    callback: (
      velocity: { x: number; y: number },
      isMomentumEnd: boolean
    ) => void
  ) {
    // Clear any pending momentum end timeout
    this.cleanUp();
    // Calculate time since last update
    const currentTime = Date.now();
    const timeSinceLastUpdate = Math.max(1, currentTime - this.lastUpdateTime);

    // Calculate velocity as distance/time
    const newVelocity = (newOffset - oldOffset) / timeSinceLastUpdate;

    // console.log(
    //   "newVelocity",
    //   newOffset,
    //   oldOffset,
    //   currentTime,
    //   this.lastUpdateTime,
    //   timeSinceLastUpdate,
    //   newVelocity
    // );
    this.lastUpdateTime = currentTime;

    // Apply velocity to the correct axis
    this.velocity.x = isHorizontal ? newVelocity : 0;
    this.velocity.y = isHorizontal ? 0 : newVelocity;

    // Trigger callback with current velocity
    callback(this.velocity, false);

    // Set timeout to signal momentum end after 100ms of no updates
    this.timeoutId = setTimeout(() => {
      this.cleanUp();
      this.lastUpdateTime = Date.now();
      this.velocity.x = 0;
      this.velocity.y = 0;
      callback(this.velocity, true);
    }, 100);
  }

  /**
   * Cleans up resources by clearing any pending timeout
   */
  cleanUp() {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
