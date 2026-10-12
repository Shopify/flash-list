import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
  useRef,
} from "react";

import { FlashListRef } from "../FlashListRef";
import { ErrorMessages } from "../errors/ErrorMessages";
import { useUnmountFlag } from "../recyclerview/hooks/useUnmountFlag";

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

  /**
   * When set to true, the benchmark will not start automatically.
   * Use the returned startBenchmark function to trigger it manually.
   */
  startManually?: boolean;
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
  return useBenchmarkRunner(
    async (cancellable) => {
      const suggestions: string[] = [];
      if (flashListRef.current) {
        if (!(Number(flashListRef.current.props.data?.length) > 0)) {
          throw new Error(ErrorMessages.dataEmptyCannotRunBenchmark);
        }
      }
      for (let i = 0; i < (params.repeatCount ?? 1); i++) {
        if (cancellable.isCancelled()) break;
        await runScrollBenchmark(
          flashListRef,
          cancellable,
          params.speedMultiplier ?? 1
        );
      }
      computeSuggestions(flashListRef, suggestions);
      return suggestions;
    },
    callback,
    params,
    true
  );
}

/** Shared lifecycle for FlashList and FlatList benchmark runs. */
export function useBenchmarkRunner(
  run: (cancellable: Cancellable) => Promise<string[]>,
  callback: (benchmarkResult: BenchmarkResult) => void,
  params: BenchmarkParams,
  suggestJSOptimization = false
) {
  const [isBenchmarkRunning, setIsBenchmarkRunning] = useState(false);
  const isUnmounted = useUnmountFlag();
  const activeRun = useRef<{
    cancellable: Cancellable;
    monitor: JSFPSMonitor;
  } | null>(null);
  const latest = useRef({ run, callback, params, suggestJSOptimization });
  useLayoutEffect(() => {
    latest.current = { run, callback, params, suggestJSOptimization };
  });
  const [initialOptions] = useState(() => ({
    startManually: params.startManually,
    startDelayInMs: params.startDelayInMs ?? 3000,
  }));

  const startBenchmark = useCallback(() => {
    if (activeRun.current || isUnmounted.current) return;
    const request = {
      cancellable: new Cancellable(),
      monitor: new JSFPSMonitor(),
    };
    activeRun.current = request;
    setIsBenchmarkRunning(true);
    const options = latest.current;
    const runBenchmark = async () => {
      let suggestions: string[] = [];
      let interrupted = false;
      let js: JSFPSResult;
      try {
        const repeatCount = options.params.repeatCount ?? 1;
        if (!Number.isInteger(repeatCount) || repeatCount < 1) {
          throw new Error("repeatCount must be a positive integer.");
        }
        request.monitor.startTracking();
        suggestions = await options.run(request.cancellable);
      } catch (error) {
        interrupted = true;
        suggestions.push(`Benchmark failed: ${String(error)}`);
      } finally {
        js = request.monitor.stopAndGetData();
        if (activeRun.current === request) {
          activeRun.current = null;
          if (!isUnmounted.current) setIsBenchmarkRunning(false);
        }
      }
      if (isUnmounted.current || request.cancellable.isCancelled()) return;
      if (!interrupted && options.suggestJSOptimization && js.averageFPS < 35) {
        suggestions.unshift(
          "Your average JS FPS is low. This can indicate that your components are doing too much work. Try to optimize your components and reduce re-renders if any"
        );
      }
      const result: BenchmarkResult = { js, suggestions, interrupted };
      result.formattedString = getFormattedString(result);
      latest.current.callback(result);
    };
    return runBenchmark();
  }, [isUnmounted]);

  useEffect(() => {
    const cancelTimeout = initialOptions.startManually
      ? undefined
      : setTimeout(startBenchmark, initialOptions.startDelayInMs);
    return () => {
      clearTimeout(cancelTimeout);
      activeRun.current?.cancellable.cancel();
      activeRun.current?.monitor.stopAndGetData();
      activeRun.current = null;
    };
  }, [initialOptions, startBenchmark]);
  return { startBenchmark, isBenchmarkRunning } as const;
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
      const toX = horizontal
        ? Math.max(0, rvContentSize.width - rvSize.width)
        : 0;
      const toY = horizontal
        ? 0
        : Math.max(0, rvContentSize.height - rvSize.height);

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
    if ((flashListRef.current.props.data?.length ?? 0) < 200) {
      suggestions.push(
        `Data count is low. Try to increase it to a large number (e.g 200) using the 'useDataMultiplier' hook.`
      );
    }
  }
}
