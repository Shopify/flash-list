import { useEffect } from "react";
import { FlatList } from "react-native";

import { autoScroll } from "..";

import { Cancellable } from "./AutoScrollHelper";
import { JSFpsMonitor } from "./JSFpsMonitor";
import {
  BenchmarkParams,
  BenchmarkResult,
  getFormattedString,
} from "./useBenchmark";

export interface FlatListBenchmarkParams extends BenchmarkParams {
  targetOffset: number;
}

export function useFlatListBenchmark(
  ref: React.MutableRefObject<FlatList<any>>,
  callback: (profilerResponse: BenchmarkResult) => void,
  params: FlatListBenchmarkParams
) {
  useEffect(() => {
    const cancellable = new Cancellable();
    if (ref.current) {
      if (!(Number(ref.current.props.data?.length) > 0)) {
        throw new Error("Data is empty, cannot run benchmark");
      }
    }
    const cancelTimeout = setTimeout(async () => {
      const jsFpsMonitor = new JSFpsMonitor();
      jsFpsMonitor.startTracking();
      await runScrollBenchmark(
        ref,
        params.targetOffset,
        cancellable,
        params.speedMultiplier || 1
      );
      const jsProfilerResponse = jsFpsMonitor.stopAndGetData();
      const result: BenchmarkResult = {
        js: jsProfilerResponse,
        suggestions: [],
        interrupted: cancellable.isCancelled(),
      };
      if (!cancellable.isCancelled()) {
        result.formattedString = getFormattedString(result);
      }
      callback(result);
    }, params.startAfterMs || 3000);
    return () => {
      clearTimeout(cancelTimeout);
      cancellable.cancel();
    };
  });
  return [];
}

async function runScrollBenchmark(
  ref: React.MutableRefObject<FlatList<any>>,
  targetOffset: number,
  cancellable: Cancellable,
  scrollSpeedMultiplier: number
): Promise<void> {
  if (ref.current) {
    const horizontal = ref.current.props.horizontal;

    const fromX = 0;
    const fromY = 0;
    const toX = horizontal ? targetOffset : 0;
    const toY = horizontal ? 0 : targetOffset;

    const scrollNow = (x, y) => {
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
