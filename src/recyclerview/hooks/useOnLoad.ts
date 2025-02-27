import { useEffect, useRef, useState } from "react";
import { RecyclerViewManager } from "../RecyclerVIewManager";

/**
 * Hook to track when the RecyclerView has loaded its items and notify when loading is complete.
 * Similar to FlashList's onLoad functionality, this hook tracks the time it takes to render
 * the initial set of items in the RecyclerView.
 *
 * @param recyclerViewManager The RecyclerViewManager instance
 * @param onLoad Callback function that will be called when the list has loaded
 * @returns Object containing isLoaded state
 */
export const useOnLoad = <T>(
  recyclerViewManager: RecyclerViewManager<T>,
  onLoad?: (info: { elapsedTimeInMs: number }) => void
): { isLoaded: boolean } => {
  const loadStartTimeRef = useRef<number>(Date.now());
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const isFirstLayoutComplete = recyclerViewManager.getIsFirstLayoutComplete();

  useEffect(() => {
    if (isFirstLayoutComplete) {
      setIsLoaded(true);
    }
  }, [isFirstLayoutComplete]);

  useEffect(() => {
    if (isLoaded) {
      const elapsedTimeInMs = Date.now() - loadStartTimeRef.current;
      console.log("----------> elapsedTimeInMs", elapsedTimeInMs);
      onLoad?.({ elapsedTimeInMs });
    }
  }, [isLoaded]);

  return { isLoaded };
};
