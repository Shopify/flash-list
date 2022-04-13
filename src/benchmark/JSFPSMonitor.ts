import { roundToDecimalPlaces } from "./roundToDecimalPlaces";

/**
 * Can be used to monitor JS thread performance
 * Use startTracking() and stopAndGetData() to start and stop tracking
 */
export class JSFPSMonitor {
  private startTime = 0;
  private frameCount = 0;
  private timeWindow = {
    frameCount: 0,
    startTime: 0,
  };

  private minFPS = Number.MAX_SAFE_INTEGER;
  private maxFPS = 0;
  private averageFPS = 0;

  private clearAnimationNumber = 0;

  private measureLoop() {
    // This looks weird but I'm avoiding a new closure
    this.clearAnimationNumber = requestAnimationFrame(this.updateLoopCompute);
  }

  private updateLoopCompute = () => {
    this.frameCount++;
    const elapsedTime = (Date.now() - this.startTime) / 1000;
    this.averageFPS = elapsedTime > 0 ? this.frameCount / elapsedTime : 0;

    this.timeWindow.frameCount++;
    const timeWindowElapsedTime =
      (Date.now() - this.timeWindow.startTime) / 1000;
    if (timeWindowElapsedTime >= 1) {
      const timeWindowAverageFPS =
        this.timeWindow.frameCount / timeWindowElapsedTime;
      this.minFPS = Math.min(this.minFPS, timeWindowAverageFPS);
      this.maxFPS = Math.max(this.maxFPS, timeWindowAverageFPS);
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
    cancelAnimationFrame(this.clearAnimationNumber);
    if (this.minFPS === Number.MAX_SAFE_INTEGER) {
      this.minFPS = this.averageFPS;
      this.maxFPS = this.averageFPS;
    }
    return {
      minFPS: roundToDecimalPlaces(this.minFPS, 1),
      maxFPS: roundToDecimalPlaces(this.maxFPS, 1),
      averageFPS: roundToDecimalPlaces(this.averageFPS, 1),
    };
  }
}

export interface JSFPSResult {
  minFPS: number;
  maxFPS: number;
  averageFPS: number;
}
