import React from "react";
import { BlankAreaEvent } from "../native/auto-layout/AutoLayoutView";
import FlashList from "../FlashList";
export interface BlankAreaTrackerResult {
    /**
     * Max blank area displayed
     */
    maxBlankArea: number;
    /**
     * Sum of all blank area values across all frames
     */
    cumulativeBlankArea: number;
}
export interface BlankAreaTrackerConfig {
    /**
     * When set to true the hook will also sum all negative blank area values.
     * Blank area is negative when list is able to draw faster than the scroll speed.
     */
    sumNegativeValues?: boolean;
    /**
     * By default, the hook ignores blank events for 1s after the list load. This value can be changed using this parameter.
     * Please note that this duration kicks in after the list has loaded and not after the first scroll.
     */
    startDelayInMs?: number;
}
/**
 * Can be used to track visible blank area in production
 * @param flashListRef Ref to the FlashList component
 * @param onBlankAreaChange This event handler will be called when the blank area changes
 * @param config additional configuration for the blank area tracker
 * @returns blankAreaTrackerResult - maxBlankArea, cumulativeBlankArea this object is mutated and kept up to date. Also returns a callback that needs to be forwarded to FlashList.
 */
export declare function useBlankAreaTracker(flashListRef: React.RefObject<FlashList<any>>, onBlankAreaChange?: (value: BlankAreaTrackerResult) => void, config?: BlankAreaTrackerConfig): [BlankAreaTrackerResult, (event: BlankAreaEvent) => void];
//# sourceMappingURL=useBlankAreaTracker.d.ts.map