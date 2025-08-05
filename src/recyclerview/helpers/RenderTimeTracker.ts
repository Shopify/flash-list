import { PlatformConfig } from "../../native/config/PlatformHelper";
import { AverageWindow } from "../../utils/AverageWindow";

export class RenderTimeTracker {
  private renderTimeAvgWindow = new AverageWindow(5);
  private lastTimerStartedAt = -1;
  private maxRenderTime = 32; // TODO: Improve this even more
  private defaultRenderTime = 16;
  private rendersWithoutCommit = 0;
  private maxRendersWithoutCommit = 40;

  startTracking() {
    this.rendersWithoutCommit++;
    if (!PlatformConfig.trackAverageRenderTimeForOffsetProjection) {
      return;
    }
    if (this.lastTimerStartedAt === -1) {
      this.lastTimerStartedAt = Date.now();
    }
  }

  markRenderComplete() {
    this.rendersWithoutCommit = 0;
    if (!PlatformConfig.trackAverageRenderTimeForOffsetProjection) {
      return;
    }
    if (this.lastTimerStartedAt !== -1) {
      this.renderTimeAvgWindow.addValue(Date.now() - this.lastTimerStartedAt);
      this.lastTimerStartedAt = -1;
    }
  }

  hasExceededMaxRendersWithoutCommit() {
    return this.rendersWithoutCommit >= this.maxRendersWithoutCommit;
  }

  getRawValue() {
    return this.renderTimeAvgWindow.currentValue;
  }

  getAverageRenderTime() {
    if (!PlatformConfig.trackAverageRenderTimeForOffsetProjection) {
      return this.defaultRenderTime;
    }
    return Math.min(
      this.maxRenderTime,
      Math.max(Math.round(this.renderTimeAvgWindow.currentValue), 16)
    );
  }
}
