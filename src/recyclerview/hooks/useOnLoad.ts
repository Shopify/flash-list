import { useEffect, useMemo, useRef, useState } from "react";

import { RecyclerViewManager } from "../RecyclerViewManager";

import { useUnmountAwareAnimationFrame } from "./useUnmountAwareCallbacks";
// import { ToastAndroid } from "react-native";

/**
 * Hook to track when the RecyclerView has loaded its items and notify when loading is complete.
 * Similar to FlashList's onLoad functionality, this hook tracks the time it takes to render
 * the initial set of items in the RecyclerView and provides performance metrics.
 *
 * @param recyclerViewManager - The RecyclerViewManager instance managing the list
 * @param onLoad - Optional callback function that will be called when the list has loaded with timing information
 * @returns Object containing isLoaded state indicating whether the list has completed initial rendering
 */
export const useOnListLoad = <T>(
  recyclerViewManager: RecyclerViewManager<T>,
  onLoad?: (info: { elapsedTimeInMs: number }) => void
): { isLoaded: boolean } => {
  const loadStartTimeRef = useRef<number>(Date.now());
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const dataLength = recyclerViewManager.getDataLength();
  // const dataCollector = useRef<number[]>([]);
  const { requestAnimationFrame } = useUnmountAwareAnimationFrame();
  // Track render cycles by collecting elapsed time on each render
  // useEffect(() => {
  //   const elapsedTimeInMs = Date.now() - loadStartTimeRef.current;
  //   dataCollector.current?.push(elapsedTimeInMs);
  // });

  useMemo(() => {
    loadStartTimeRef.current = Date.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataLength]);

  useOnLoad(recyclerViewManager, () => {
    const elapsedTimeInMs = Date.now() - loadStartTimeRef.current;
    // Commented code below was used for debugging purposes
    // to display all collected timing data points
    // const dataCollectorString = dataCollector.current
    //   ?.map((value) => value.toString())
    //   .join(", ");
    // ToastAndroid?.show(
    //   `onLoad called after ${dataCollectorString}`,
    //   ToastAndroid.SHORT
    // );
    // console.log("----------> dataCollector", dataCollectorString);
    // console.log("----------> FlashList v2 load in", `${elapsedTimeInMs} ms`);
    requestAnimationFrame(() => {
      onLoad?.({ elapsedTimeInMs });
      setIsLoaded(true);
    });
  });

  return { isLoaded };
};

/**
 * Core hook that detects when a RecyclerView has completed its initial layout.
 * This hook monitors the RecyclerViewManager and triggers the provided callback
 * once the first layout is complete.
 *
 * @param recyclerViewManager - The RecyclerViewManager instance to monitor
 * @param onLoad - Callback function that will be called once when the first layout is complete
 */
export const useOnLoad = <T>(
  recyclerViewManager: RecyclerViewManager<T>,
  onLoad: () => void
) => {
  const isLoaded = useRef<boolean>(false);
  useEffect(() => {
    // Only trigger onLoad callback once when first layout is complete
    if (recyclerViewManager.getIsFirstLayoutComplete() && !isLoaded.current) {
      isLoaded.current = true;
      onLoad();
    }
  });
};
