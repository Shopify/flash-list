import React, { useCallback, useRef } from "react";
import { BlankAreaEvent } from "../AutoLayoutView";
import FlashList from "../FlashList";

export interface BlankAreaTrackerResult {
  maxBlankArea: number;
  cumulativeBlankArea: number;
}
export interface BlankAreaTrackerConfig {
  sumNegativeValues?: boolean;
  startDelayInMs?: number;
}

/**
 * Can be used to track visible blank area in production
 * @param flashListRef Ref to the FlashList component
 * @param onBlankAreaChange This event handler will be called when the blank area changes
 * @param config additional configuration for the blank area tracker
 * @returns blankAreaTrackerResult - maxBlankArea, cumulativeBlankArea this object is mutated and kept upto date. Also returns a callback that needs to be forwarded to FlashList.
 */
export function useBlankAreaTracker(
  flashListRef: React.RefObject<FlashList<any>>,
  onBlankAreaChange?: (value: BlankAreaTrackerResult) => void,
  config?: BlankAreaTrackerConfig
): [BlankAreaTrackerResult, (event: BlankAreaEvent) => void] {
  const startDelay = config?.startDelayInMs ?? 500;
  const blankAreaResult = useRef({
    maxBlankArea: 0,
    cumulativeBlankArea: 0,
  }).current;
  const waitOps = useRef({ inProgress: false, complete: false }).current;
  const onBlankAreaChangeRef = useRef(onBlankAreaChange);
  onBlankAreaChangeRef.current = onBlankAreaChange;

  const blankAreaTracker = useCallback(
    (event: BlankAreaEvent) => {
      if (!waitOps.complete) {
        if (!waitOps.inProgress) {
          waitOps.inProgress = true;
          setTimeout(() => {
            waitOps.complete = true;
          }, startDelay);
        }
        return;
      }
      const rlv = flashListRef.current?.recyclerlistview_unsafe;
      const horizontal = flashListRef.current?.props.horizontal;
      if (rlv) {
        const listSize = horizontal
          ? rlv.getRenderedSize().width
          : rlv.getRenderedSize().height;
        const contentSize = horizontal
          ? rlv.getContentDimension().width
          : rlv.getContentDimension().height;
        if (contentSize > listSize) {
          const lastMaxBlankArea = blankAreaResult.maxBlankArea;
          const lastCumulativeBlankArea = blankAreaResult.cumulativeBlankArea;
          blankAreaResult.maxBlankArea = Math.max(
            blankAreaResult.maxBlankArea,
            event.blankArea,
            0
          );
          blankAreaResult.cumulativeBlankArea += config?.sumNegativeValues
            ? event.blankArea
            : Math.max(event.blankArea, 0);
          if (
            lastCumulativeBlankArea !== blankAreaResult.cumulativeBlankArea ||
            lastMaxBlankArea !== blankAreaResult.maxBlankArea
          ) {
            onBlankAreaChangeRef.current?.(blankAreaResult);
          }
        }
      }
    },
    [flashListRef]
  );
  return [blankAreaResult, blankAreaTracker];
}
