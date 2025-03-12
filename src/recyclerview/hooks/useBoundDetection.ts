import { useEffect, useMemo } from "react";
import { useRef } from "react";
import { RecyclerViewManager } from "../RecyclerViewManager";
import { RecyclerViewProps } from "../RecyclerViewProps";

/**
 * Hook to detect when the scroll position reaches near the start or end of the list
 * and trigger the appropriate callbacks.
 *
 * @param recyclerViewManager - The RecyclerViewManager instance
 * @param props - The RecyclerViewProps
 */
export function useBoundDetection<T>(
  recyclerViewManager: RecyclerViewManager<T>,
  props: RecyclerViewProps<T>
) {
  const pendingEndReached = useRef(false);
  const pendingStartReached = useRef(false);

  useMemo(() => {
    pendingEndReached.current = false;
  }, [props.data]);

  const checkBounds = () => {
    // Skip all calculations if neither callback is provided

    if (!props.onEndReached && !props.onStartReached) {
      return;
    }

    if (recyclerViewManager.getIsFirstLayoutComplete()) {
      const lastScrollOffset = recyclerViewManager.getLastScrollOffset();
      const contentSize = recyclerViewManager.getChildContainerLayout();
      const windowSize = recyclerViewManager.getWindowSize();
      const isHorizontal = props.horizontal === true;

      // Calculate common values used by both end and start detection
      const visibleLength = isHorizontal ? windowSize.width : windowSize.height;
      const contentLength = isHorizontal
        ? contentSize.width
        : contentSize.height;

      // Only calculate and check end reached if the callback is provided
      if (props.onEndReached) {
        const onEndReachedThreshold = props.onEndReachedThreshold || 0.5;
        const endThresholdDistance = onEndReachedThreshold * visibleLength;

        const isNearEnd =
          lastScrollOffset + visibleLength >=
          contentLength - endThresholdDistance;

        if (isNearEnd && !pendingEndReached.current) {
          pendingEndReached.current = true;
          props.onEndReached();
        }
        pendingEndReached.current = isNearEnd;
      }

      // Only calculate and check start reached if the callback is provided
      if (props.onStartReached) {
        const onStartReachedThreshold = props.onStartReachedThreshold || 0.5;
        const startThresholdDistance = onStartReachedThreshold * visibleLength;

        const isNearStart = lastScrollOffset <= startThresholdDistance;

        if (isNearStart && !pendingStartReached.current) {
          pendingStartReached.current = true;
          props.onStartReached();
        }
        pendingStartReached.current = isNearStart;
      }
    }
  };

  return {
    checkBounds,
  };
}
