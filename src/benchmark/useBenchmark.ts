import React, { useEffect } from "react";

import { BlankAreaEvent } from "../AutoLayoutView";
import RecyclerFlatList from "../RecyclerFlatList";

import { autoScroll, Cancellable } from "./AutoScrollHelper";
import { JSFpsMonitor, JSFPSResult } from "./JSFpsMonitor";

export interface BenchmarkParams {
  startAfterMs?: number;
  speedMultiplier?: number;
  endOffset?: number;
}

export interface BenchmarkResult {
  js?: JSFPSResult;
  interrupted?: boolean;
  suggestions: string[];
  blankArea?: BlankAreaBenchmarkResult;
}

export interface BlankAreaBenchmarkResult {
  maxBlankArea: number;
  cumulativeBlankArea: number;
}

export function useBenchmark(
  ref: React.MutableRefObject<RecyclerFlatList<any>>,
  callback: (profilerResponse: any) => void,
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
    const cancelTimeout = setTimeout(async () => {
      const jsFpsMonitor = new JSFpsMonitor();
      jsFpsMonitor.startTracking();
      await runScrollBenchmark(ref, cancellable, params.speedMultiplier || 1);
      const jsProfilerResponse = jsFpsMonitor.stopAndGetData();
      if (jsProfilerResponse.averageFps < 35) {
        suggestions.push(
          `Your average JS FPS is low. This can indicate that your compoenents are doing too much work. Try to optimize your components and reduce re-renders if any`
        );
      }
      computeSuggestions(ref, suggestions);
      callback({
        js: jsProfilerResponse,
        blankArea:
          blankAreaResult.maxBlankArea >= 0 ? blankAreaResult : undefined,
        suggestions,
        interrupted: cancellable.isCancelled(),
      });
    }, params.startAfterMs || 3000);
    return () => {
      clearTimeout(cancelTimeout);
      cancellable.cancel();
    };
  });
  return [blankAreaTracker];
}
export function useDataMultiplier<T>(data: T[], count): T[] {
  const len = data.length;
  const arr = new Array<T>(count);
  let isObject = false;
  if (typeof data[0] === "object") {
    isObject = true;
  }
  for (let i = 0; i < count; i++) {
    arr[i] = isObject ? { ...data[i % len] } : data[i % len];
  }
  return arr;
}

async function runScrollBenchmark(
  ref: React.MutableRefObject<RecyclerFlatList<any>>,
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

      const speedMultiplier = 50 * scrollSpeedMultiplier;

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
        speedMultiplier,
        cancellable
      );
      await autoScroll(
        scrollNow,
        toX,
        toY,
        fromX,
        fromY,
        speedMultiplier,
        cancellable
      );
    }
  }
}
function computeSuggestions(
  ref: React.MutableRefObject<RecyclerFlatList<any>>,
  suggestions: string[]
) {
  if (ref.current) {
    if (ref.current.props.data!!.length < 200) {
      suggestions.push(
        `Data count is low. Try to increase it to a large number (e.g, 200) using the "useDataMultiplier" hook.`
      );
    }
    // TODO: Fix private property access
    const distanceFromWindow = (ref.current as any).distanceFromWindow;
    if (ref.current.props.estimatedFirstItemOffset !== distanceFromWindow) {
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
      const median = sortedSizes[Math.floor(sortedSizes.length / 2)];
      if (Math.abs(median - ref.current.props.estimatedItemSize) > 5) {
        suggestions.push(`estimatedItemSize can be set to ${median}`);
      }
    }
  }
}
