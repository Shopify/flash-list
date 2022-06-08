import React, { useCallback, useRef } from "react";
import { RecyclerListView, RecyclerListViewProps } from "recyclerlistview";

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
export function useBlankAreaTracker(
  flashListRef: React.RefObject<FlashList<any>>,
  onBlankAreaChange?: (value: BlankAreaTrackerResult) => void,
  config?: BlankAreaTrackerConfig
): [BlankAreaTrackerResult, (event: BlankAreaEvent) => void] {
  const startDelay = config?.startDelayInMs ?? 1000;
  const blankAreaResult = useRef({
    maxBlankArea: 0,
    cumulativeBlankArea: 0,
  }).current;
  const waitOperations = useRef({ inProgress: false, complete: false }).current;
  const onBlankAreaChangeRef = useRef(onBlankAreaChange);
  onBlankAreaChangeRef.current = onBlankAreaChange;

  const blankAreaTracker = useCallback(
    (event: BlankAreaEvent) => {
      // we're ignoring some of the events that will be fired on list load
      // initial events are fired on mount and thus, this won't lead to missing events during scroll
      if (!waitOperations.complete && startDelay > 0) {
        if (!waitOperations.inProgress) {
          waitOperations.inProgress = true;
          setTimeout(() => {
            waitOperations.complete = true;
          }, startDelay);
        }
        return;
      }
      const rlv = flashListRef.current?.recyclerlistview_unsafe;
      const horizontal = Boolean(flashListRef.current?.props.horizontal);
      if (rlv) {
        processBlankAreaChange(
          rlv,
          horizontal,
          blankAreaResult,
          event,
          onBlankAreaChangeRef.current,
          config
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [flashListRef]
  );
  return [blankAreaResult, blankAreaTracker];
}

function processBlankAreaChange(
  rlv: RecyclerListView<RecyclerListViewProps, any>,
  horizontal: boolean,
  blankAreaResult: BlankAreaTrackerResult,
  event: BlankAreaEvent,
  onBlankAreaChange?: (value: BlankAreaTrackerResult) => void,
  config?: BlankAreaTrackerConfig
) {
  const listSize = horizontal
    ? rlv.getRenderedSize().width
    : rlv.getRenderedSize().height;
  const contentSize = horizontal
    ? rlv.getContentDimension().width
    : rlv.getContentDimension().height;

  // ignores blank events when there isn't enough content to fill the list
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
      onBlankAreaChange?.(blankAreaResult);
    }
  }
}
