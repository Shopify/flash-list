import { roundToDecimalPlaces } from "./roundToDecimalPlaces";

/**
 * Can be used to monitor JS thread performance
 * Use startTracking() and stopAndGetData() to start and stop tracking
 */
export class JSFpsMonitor {
  private startTime = 0;
  private frameCount = 0;
  private timeWindow = {
    frameCount: 0,
    startTime: 0,
  };

  private minFps = Number.MAX_SAFE_INTEGER;
  private maxFps = 0;
  private averageFps = 0;

  private clearAnimationNum = 0;

  private measureLoop() {
    // This looks weird but I'm avoiding a new closure
    this.clearAnimationNum = requestAnimationFrame(this.updateLoopCompute);
  }

  private updateLoopCompute = () => {
    this.frameCount++;
    const elaspedTime = (Date.now() - this.startTime) / 1000;
    this.averageFps = elaspedTime > 0 ? this.frameCount / elaspedTime : 0;

    this.timeWindow.frameCount++;
    const timeWindowElaspedTime =
      (Date.now() - this.timeWindow.startTime) / 1000;
    if (timeWindowElaspedTime >= 1) {
      const timeWindowAverageFps =
        this.timeWindow.frameCount / timeWindowElaspedTime;
      this.minFps = Math.min(this.minFps, timeWindowAverageFps);
      this.maxFps = Math.max(this.maxFps, timeWindowAverageFps);
      this.timeWindow.frameCount = 0;
      this.timeWindow.startTime = Date.now();
    }
    this.measureLoop();
  };

  public startTracking() {
    if (this.startTime !== 0) {
      throw new Error(
        "This FPS Monitor has already been run, please create a new instance"
      );
    }
    this.startTime = Date.now();
    this.timeWindow.startTime = Date.now();
    this.measureLoop();
  }

  public stopAndGetData(): JSFPSResult {
    cancelAnimationFrame(this.clearAnimationNum);
    return {
      minFps: roundToDecimalPlaces(this.minFps, 1),
      maxFps: roundToDecimalPlaces(this.maxFps, 1),
      averageFps: roundToDecimalPlaces(this.averageFps, 1),
    };
  }
}

export interface JSFPSResult {
  minFps: number;
  maxFps: number;
  averageFps: number;
}
