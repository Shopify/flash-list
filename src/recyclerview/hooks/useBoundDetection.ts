import { useCallback, useEffect, useMemo } from "react";
import { useRef } from "react";
import { RecyclerViewManager } from "../RecyclerViewManager";
import { RecyclerViewProps } from "../RecyclerViewProps";
import { CompatScroller } from "../components/CompatScroller";

/**
 * Hook to detect when the scroll position reaches near the start or end of the list
 * and trigger the appropriate callbacks.
 *
 * @param recyclerViewManager - The RecyclerViewManager instance
 * @param props - The RecyclerViewProps
 */
export function useBoundDetection<T>(
  recyclerViewManager: RecyclerViewManager<T>,
  props: RecyclerViewProps<T>,
  scrollViewRef: React.RefObject<CompatScroller>
) {
  const pendingEndReached = useRef(false);
  const pendingStartReached = useRef(false);
  const pendingAutoscrollToBottom = useRef(false);
  const { horizontal, data, maintainVisibleContentPosition } = props;

  const checkBounds = useCallback(() => {
    // Skip all calculations if neither callback is provided
    const autoscrollToBottomThreshold =
      maintainVisibleContentPosition?.autoscrollToBottomThreshold ?? -1;

    if (
      !props.onEndReached &&
      !props.onStartReached &&
      autoscrollToBottomThreshold < 0
    ) {
      return;
    }

    if (recyclerViewManager.getIsFirstLayoutComplete()) {
      const lastScrollOffset =
        recyclerViewManager.getAbsoluteLastScrollOffset();
      const contentSize = recyclerViewManager.getChildContainerDimensions();
      const windowSize = recyclerViewManager.getWindowSize();
      const isHorizontal = props.horizontal === true;

      // Calculate common values used by both end and start detection
      const visibleLength = isHorizontal ? windowSize.width : windowSize.height;
      const contentLength =
        (isHorizontal ? contentSize.width : contentSize.height) +
        recyclerViewManager.firstItemOffset;

      // Only calculate and check end reached if the callback is provided
      if (props.onEndReached) {
        const onEndReachedThreshold = props.onEndReachedThreshold ?? 0.5;
        const endThresholdDistance = onEndReachedThreshold * visibleLength;

        const isNearEnd =
          Math.ceil(lastScrollOffset + visibleLength) >=
          contentLength - endThresholdDistance;

        if (isNearEnd && !pendingEndReached.current) {
          pendingEndReached.current = true;
          props.onEndReached();
        }
        pendingEndReached.current = isNearEnd;
      }

      // Only calculate and check start reached if the callback is provided
      if (props.onStartReached) {
        const onStartReachedThreshold = props.onStartReachedThreshold ?? 0.5;
        const startThresholdDistance = onStartReachedThreshold * visibleLength;

        const isNearStart = lastScrollOffset <= startThresholdDistance;

        if (isNearStart && !pendingStartReached.current) {
          pendingStartReached.current = true;
          props.onStartReached();
        }
        pendingStartReached.current = isNearStart;
      }

      if (!horizontal) {
        const autoscrollToBottomThresholdDistance =
          autoscrollToBottomThreshold * visibleLength;

        const isNearBottom =
          Math.ceil(lastScrollOffset + visibleLength) >=
          contentLength - autoscrollToBottomThresholdDistance;

        if (isNearBottom) {
          pendingAutoscrollToBottom.current = true;
        } else {
          pendingAutoscrollToBottom.current = false;
        }
      }
    }
  }, [recyclerViewManager, props]);

  useMemo(() => {
    pendingEndReached.current = false;
  }, [data]);

  useEffect(() => {
    if (pendingAutoscrollToBottom.current) {
      scrollViewRef.current?.scrollToEnd();
      pendingAutoscrollToBottom.current = false;
    }
  }, [data]);

  return {
    checkBounds,
  };
}
