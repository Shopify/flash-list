/**
 * Can be used to monitor JS thread performance
 * Use startTracking() and stopAndGetData() to start and stop tracking
 */
export declare class JSFPSMonitor {
    private startTime;
    private frameCount;
    private timeWindow;
    private minFPS;
    private maxFPS;
    private averageFPS;
    private clearAnimationNumber;
    private measureLoop;
    private updateLoopCompute;
    startTracking(): void;
    stopAndGetData(): JSFPSResult;
}
export interface JSFPSResult {
    minFPS: number;
    maxFPS: number;
    averageFPS: number;
}
//# sourceMappingURL=JSFPSMonitor.d.ts.map