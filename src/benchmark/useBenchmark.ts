import React, { useEffect } from "react";

import { BlankAreaEvent } from "../AutoLayoutView";
import FlashList from "../FlashList";

import { autoScroll, Cancellable } from "./AutoScrollHelper";
import { JSFpsMonitor, JSFPSResult } from "./JSFpsMonitor";
import { roundToDecimalPlaces } from "./roundToDecimalPlaces";

export interface BenchmarkParams {
  startDelayInMs?: number;

  // Can be used to increase or decrease speed of scrolling
  speedMultiplier?: number;
}

export interface BenchmarkResult {
  js?: JSFPSResult;
  interrupted?: boolean;
  suggestions: string[];
  blankArea?: BlankAreaBenchmarkResult;
  formattedString?: string;
}

export interface BlankAreaBenchmarkResult {
  maxBlankArea: number;
  cumulativeBlankArea: number;
}

/**
 * Runs the benchmark on FlashList.
 * Response object has a formatted string that can be printed to the console or, shown as an alert.
 * Result is posted to the callback method passed to the hook.
 */

export function useBenchmark(
  ref: React.MutableRefObject<FlashList<any>>,
  callback: (profilerResponse: BenchmarkResult) => void,
  params: BenchmarkParams = {}
) {
  const blankAreaResult = {
    maxBlankArea: -1,
    cumulativeBlankArea: 0,
  };
  const blankAreaTracker = (event: BlankAreaEvent) => {
    blankAreaResult.maxBlankArea = Math.max(
      blankAreaResult.maxBlankArea,
      event.blankArea,
      0
    );
    blankAreaResult.cumulativeBlankArea += Math.max(event.blankArea, 0);
  };
  useEffect(() => {
    const cancellable = new Cancellable();
    const suggestions: string[] = [];
    if (ref.current) {
      if (!(Number(ref.current.props.data?.length) > 0)) {
        throw new Error("Data is empty, cannot run benchmark");
      }
      ref.current.forceDisableOnEndReachedCallback();
    }
    const cancelTimeout = setTimeout(async () => {
      const jsFpsMonitor = new JSFpsMonitor();
      jsFpsMonitor.startTracking();
      await runScrollBenchmark(ref, cancellable, params.speedMultiplier || 1);
      const jsProfilerResponse = jsFpsMonitor.stopAndGetData();
      if (jsProfilerResponse.averageFps < 35) {
        suggestions.push(
          `Your average JS FPS is low. This can indicate that your components are doing too much work. Try to optimize your components and reduce re-renders if any`
        );
      }
      computeSuggestions(ref, suggestions);
      const result: BenchmarkResult = {
        js: jsProfilerResponse,
        blankArea:
          blankAreaResult.maxBlankArea >= 0
            ? {
                maxBlankArea: roundToDecimalPlaces(
                  blankAreaResult.maxBlankArea,
                  0
                ),
                cumulativeBlankArea: roundToDecimalPlaces(
                  blankAreaResult.cumulativeBlankArea,
                  0
                ),
              }
            : undefined,
        suggestions,
        interrupted: cancellable.isCancelled(),
      };
      if (!cancellable.isCancelled()) {
        result.formattedString = getFormattedString(result);
      }
      callback(result);
    }, params.startDelayInMs || 3000);
    return () => {
      clearTimeout(cancelTimeout);
      cancellable.cancel();
    };
  });
  return [blankAreaTracker];
}

export function getFormattedString(res: BenchmarkResult) {
  return (
    `Results:\n\n` +
    `JS FPS: Avg: ${res.js?.averageFps} | Min: ${res.js?.minFps} | Max: ${res.js?.maxFps}\n\n` +
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

async function runScrollBenchmark(
  ref: React.MutableRefObject<FlashList<any>>,
  cancellable: Cancellable,
  scrollSpeedMultiplier: number
): Promise<void> {
  if (ref.current) {
    const horizontal = ref.current.props.horizontal;
    const rlv = ref.current.getRecyclerListView();
    if (rlv) {
      const rlvSize = rlv.getRenderedSize();
      const rlvContentSize = rlv.getContentDimension();

      const fromX = 0;
      const fromY = 0;
      const toX = rlvContentSize.width - rlvSize.width;
      const toY = rlvContentSize.height - rlvSize.height;

      const scrollNow = (x: number, y: number) => {
        ref.current?.scrollToOffset({
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
  ref: React.MutableRefObject<FlashList<any>>,
  suggestions: string[]
) {
  if (ref.current) {
    if (ref.current.props.data!!.length < 200) {
      suggestions.push(
        `Data count is low. Try to increase it to a large number (e.g, 200) using the 'useDataMultiplier' hook.`
      );
    }
    const distanceFromWindow = roundToDecimalPlaces(
      ref.current.getFirstItemOffset(),
      0
    );
    if (
      (ref.current.props.estimatedFirstItemOffset || 0) !== distanceFromWindow
    ) {
      suggestions.push(
        `estimatedFirstItemOffset can be set to ${distanceFromWindow}`
      );
    }
    const rlv = ref.current.getRecyclerListView();
    const horizontal = ref.current.props.horizontal;
    if (rlv) {
      const sizeArray = rlv.props.dataProvider
        .getAllData()
        .map((_, index) =>
          horizontal
            ? rlv.getLayout?.(index)?.width || 0
            : rlv.getLayout?.(index)?.height || 0
        );
      const sortedSizes = sizeArray.sort();
      const median = roundToDecimalPlaces(
        sortedSizes[Math.floor(sortedSizes.length / 2)],
        0
      );
      if (Math.abs(median - ref.current.props.estimatedItemSize) > 5) {
        suggestions.push(`estimatedItemSize can be set to ${median}`);
      }
    }
  }
}
