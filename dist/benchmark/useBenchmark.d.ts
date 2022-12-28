import React from "react";
import FlashList from "../FlashList";
import { JSFPSResult } from "./JSFPSMonitor";
import { BlankAreaTrackerResult } from "./useBlankAreaTracker";
export interface BenchmarkParams {
    startDelayInMs?: number;
    /**
     * Can be used to increase or decrease speed of scrolling
     */
    speedMultiplier?: number;
    /**
     * Specify the number of times benchmark should repeat itself
     */
    repeatCount?: number;
    /**
     * When set to true, cumulative blank area will include sum of negative blank area values
     * Blank area is negative when list is able to draw faster than the scroll speed.
     */
    sumNegativeBlankAreaValues?: boolean;
}
export interface BenchmarkResult {
    js?: JSFPSResult;
    interrupted: boolean;
    suggestions: string[];
    blankArea?: BlankAreaTrackerResult;
    formattedString?: string;
}
/**
 * Runs the benchmark on FlashList.
 * Response object has a formatted string that can be printed to the console or shown as an alert.
 * Result is posted to the callback method passed to the hook.
 */
export declare function useBenchmark(flashListRef: React.RefObject<FlashList<any>>, callback: (benchmarkResult: BenchmarkResult) => void, params?: BenchmarkParams): ((event: import("..").BlankAreaEvent) => void)[];
export declare function getFormattedString(res: BenchmarkResult): string;
//# sourceMappingURL=useBenchmark.d.ts.map