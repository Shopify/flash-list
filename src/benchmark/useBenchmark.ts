import React, { useEffect } from "react";

import { FlashListRef } from "../FlashListRef";
import { ErrorMessages } from "../errors/ErrorMessages";

import { autoScroll, Cancellable } from "./AutoScrollHelper";
import { JSFPSMonitor, JSFPSResult } from "./JSFPSMonitor";

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
  formattedString?: string;
}

/**
 * Runs the benchmark on FlashList.
 * Response object has a formatted string that can be printed to the console or shown as an alert.
 * Result is posted to the callback method passed to the hook.
 */

export function useBenchmark(
  flashListRef: React.RefObject<FlashListRef<any>>,
  callback: (benchmarkResult: BenchmarkResult) => void,
  params: BenchmarkParams = {}
) {
  useEffect(() => {
    const cancellable = new Cancellable();
    const suggestions: string[] = [];
    if (flashListRef.current) {
      if (!(Number(flashListRef.current.props.data?.length) > 0)) {
        throw new Error(ErrorMessages.dataEmptyCannotRunBenchmark);
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
}

export function getFormattedString(res: BenchmarkResult) {
  return (
    `Results:\n\n` +
    `JS FPS: Avg: ${res.js?.averageFPS} | Min: ${res.js?.minFPS} | Max: ${res.js?.maxFPS}\n\n` +
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
  suggestions: string[],
  cancellable: Cancellable
) {
  return {
    js: jsProfilerResponse,
    suggestions,
    interrupted: cancellable.isCancelled(),
  };
}

/**
 * Scrolls to the end of the list and then back to the top
 */
async function runScrollBenchmark(
  flashListRef: React.RefObject<FlashListRef<any> | null | undefined>,
  cancellable: Cancellable,
  scrollSpeedMultiplier: number
): Promise<void> {
  if (flashListRef.current) {
    const horizontal = flashListRef.current.props.horizontal;
    const rv = flashListRef.current;
    if (rv) {
      const rvSize = rv.getWindowSize();
      const rvContentSize = rv.getChildContainerDimensions();

      const fromX = 0;
      const fromY = 0;
      const toX = rvContentSize.width - rvSize.width;
      const toY = rvContentSize.height - rvSize.height;

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
  flashListRef: React.RefObject<FlashListRef<any> | null | undefined>,
  suggestions: string[]
) {
  if (flashListRef.current) {
    if (flashListRef.current.props.data!!.length < 200) {
      suggestions.push(
        `Data count is low. Try to increase it to a large number (e.g 200) using the 'useDataMultiplier' hook.`
      );
    }
  }
}
