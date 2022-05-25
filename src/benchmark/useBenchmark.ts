import React, { useEffect } from "react";

import FlashList from "../FlashList";

import { autoScroll, Cancellable } from "./AutoScrollHelper";
import { JSFPSMonitor, JSFPSResult } from "./JSFPSMonitor";
import { roundToDecimalPlaces } from "./roundToDecimalPlaces";
import {
  BlankAreaTrackerResult,
  useBlankAreaTracker,
} from "./useBlankAreaTracker";

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

export function useBenchmark(
  flashListRef: React.RefObject<FlashList<any>>,
  callback: (benchmarkResult: BenchmarkResult) => void,
  params: BenchmarkParams = {}
) {
  const [blankAreaResult, blankAreaTracker] = useBlankAreaTracker(
    flashListRef,
    undefined,
    { sumNegativeValues: params.sumNegativeBlankAreaValues, startDelayInMs: 0 }
  );
  useEffect(() => {
    const cancellable = new Cancellable();
    const suggestions: string[] = [];
    if (flashListRef.current) {
      if (!(Number(flashListRef.current.props.data?.length) > 0)) {
        throw new Error("Data is empty, cannot run benchmark");
      }
    }
    const cancelTimeout = setTimeout(async () => {
      const jsFPSMonitor = new JSFPSMonitor();
      jsFPSMonitor.startTracking();
      for (let i = 0; i < (params.repeatCount || 1); i++) {
        await runScrollBenchmark(
          flashListRef,
          cancellable,
          params.speedMultiplier || 1
        );
      }
      const jsProfilerResponse = jsFPSMonitor.stopAndGetData();
      if (jsProfilerResponse.averageFPS < 35) {
        suggestions.push(
          `Your average JS FPS is low. This can indicate that your components are doing too much work. Try to optimize your components and reduce re-renders if any`
        );
      }
      computeSuggestions(flashListRef, suggestions);
      const result: BenchmarkResult = generateResult(
        jsProfilerResponse,
        blankAreaResult,
        suggestions,
        cancellable
      );
      if (!cancellable.isCancelled()) {
        result.formattedString = getFormattedString(result);
      }
      callback(result);
    }, params.startDelayInMs || 3000);
    return () => {
      clearTimeout(cancelTimeout);
      cancellable.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [blankAreaTracker];
}

export function getFormattedString(res: BenchmarkResult) {
  return (
    `Results:\n\n` +
    `JS FPS: Avg: ${res.js?.averageFPS} | Min: ${res.js?.minFPS} | Max: ${res.js?.maxFPS}\n\n` +
    `${
      res.blankArea
        ? `Blank Area: Max: ${res.blankArea?.maxBlankArea} Cumulative: ${res.blankArea?.cumulativeBlankArea}\n\n`
        : ``
    }` +
    `${
      res.suggestions.length > 0
        ? `Suggestions:\n\n${res.suggestions
            .map((value, index) => `${index + 1}. ${value}`)
            .join("\n")}`
        : ``
    }`
  );
}

function generateResult(
  jsProfilerResponse: JSFPSResult,
  blankAreaResult: BlankAreaTrackerResult,
  suggestions: string[],
  cancellable: Cancellable
) {
  return {
    js: jsProfilerResponse,
    blankArea:
      blankAreaResult.maxBlankArea >= 0
        ? {
            maxBlankArea: roundToDecimalPlaces(blankAreaResult.maxBlankArea, 0),
            cumulativeBlankArea: roundToDecimalPlaces(
              blankAreaResult.cumulativeBlankArea,
              0
            ),
          }
        : undefined,
    suggestions,
    interrupted: cancellable.isCancelled(),
  };
}

/**
 * Scrolls to the end of the list and then back to the top
 */
async function runScrollBenchmark(
  flashListRef: React.RefObject<FlashList<any> | null | undefined>,
  cancellable: Cancellable,
  scrollSpeedMultiplier: number
): Promise<void> {
  if (flashListRef.current) {
    const horizontal = flashListRef.current.props.horizontal;
    const rlv = flashListRef.current.recyclerlistview_unsafe;
    if (rlv) {
      const rlvSize = rlv.getRenderedSize();
      const rlvContentSize = rlv.getContentDimension();

      const fromX = 0;
      const fromY = 0;
      const toX = rlvContentSize.width - rlvSize.width;
      const toY = rlvContentSize.height - rlvSize.height;

      const scrollNow = (x: number, y: number) => {
        flashListRef.current?.scrollToOffset({
          offset: horizontal ? x : y,
          animated: false,
        });
      };

      await autoScroll(
        scrollNow,
        fromX,
        fromY,
        toX,
        toY,
        scrollSpeedMultiplier,
        cancellable
      );
      await autoScroll(
        scrollNow,
        toX,
        toY,
        fromX,
        fromY,
        scrollSpeedMultiplier,
        cancellable
      );
    }
  }
}
function computeSuggestions(
  flashListRef: React.RefObject<FlashList<any> | null | undefined>,
  suggestions: string[]
) {
  if (flashListRef.current) {
    if (flashListRef.current.props.data!!.length < 200) {
      suggestions.push(
        `Data count is low. Try to increase it to a large number (e.g 200) using the 'useDataMultiplier' hook.`
      );
    }
    const distanceFromWindow = roundToDecimalPlaces(
      flashListRef.current.firstItemOffset,
      0
    );
    if (
      (flashListRef.current.props.estimatedFirstItemOffset || 0) !==
      distanceFromWindow
    ) {
      suggestions.push(
        `estimatedFirstItemOffset can be set to ${distanceFromWindow}`
      );
    }
    const rlv = flashListRef.current.recyclerlistview_unsafe;
    const horizontal = flashListRef.current.props.horizontal;
    if (rlv) {
      const sizeArray = rlv.props.dataProvider
        .getAllData()
        .map((_, index) =>
          horizontal
            ? rlv.getLayout?.(index)?.width || 0
            : rlv.getLayout?.(index)?.height || 0
        );
      const averageSize = Math.round(
        sizeArray.reduce((prev, current) => prev + current, 0) /
          sizeArray.length
      );
      if (
        Math.abs(
          averageSize -
            (flashListRef.current.props.estimatedItemSize ??
              flashListRef.current.state.layoutProvider
                .defaultEstimatedItemSize)
        ) > 5
      ) {
        suggestions.push(`estimatedItemSize can be set to ${averageSize}`);
      }
    }
  }
}
