import { useCallback, useEffect, useMemo, useRef } from "react";

import { RecyclerViewManager } from "../RecyclerViewManager";
import { CompatScroller } from "../components/CompatScroller";

import { useUnmountAwareAnimationFrame } from "./useUnmountAwareCallbacks";

/**
 * Hook to detect when the scroll position reaches near the start or end of the list
 * and trigger the appropriate callbacks. This hook is responsible for:
 * 1. Detecting when the user scrolls near the end of the list (onEndReached)
 * 2. Detecting when the user scrolls near the start of the list (onStartReached)
 * 3. Managing auto-scrolling to bottom when new content is added
 *
 * @param recyclerViewManager - The RecyclerViewManager instance that handles the list's core functionality
 * @param props - The RecyclerViewProps containing configuration and callbacks
 * @param scrollViewRef - Reference to the scrollable container component
 */
export function useBoundDetection<T>(
  recyclerViewManager: RecyclerViewManager<T>,
  scrollViewRef: React.RefObject<CompatScroller>
) {
  // Track whether we've already triggered the end reached callback to prevent duplicate calls
  const pendingEndReached = useRef(false);
  // Track whether we've already triggered the start reached callback to prevent duplicate calls
  const pendingStartReached = useRef(false);
  // Track whether we should auto-scroll to bottom when new content is added
  const pendingAutoscrollToBottom = useRef(false);

  const lastCheckBoundsTime = useRef(Date.now());

  const { data } = recyclerViewManager.props;
  const { requestAnimationFrame } = useUnmountAwareAnimationFrame();

  const windowHeight = recyclerViewManager.hasLayout()
    ? recyclerViewManager.getWindowSize().height
    : 0;

  const contentHeight = recyclerViewManager.hasLayout()
    ? recyclerViewManager.getChildContainerDimensions().height
    : 0;

  const windowWidth = recyclerViewManager.hasLayout()
    ? recyclerViewManager.getWindowSize().width
    : 0;

  const contentWidth = recyclerViewManager.hasLayout()
    ? recyclerViewManager.getChildContainerDimensions().width
    : 0;

  /**
   * Checks if the scroll position is near the start or end of the list
   * and triggers appropriate callbacks if configured.
   */
  const checkBounds = useCallback(() => {
    lastCheckBoundsTime.current = Date.now();

    const {
      onEndReached,
      onStartReached,
      maintainVisibleContentPosition,
      horizontal,
      onEndReachedThreshold: onEndReachedThresholdProp,
      onStartReachedThreshold: onStartReachedThresholdProp,
    } = recyclerViewManager.props;
    // Skip all calculations if neither callback is provided and autoscroll is disabled
    const autoscrollToBottomThreshold =
      maintainVisibleContentPosition?.autoscrollToBottomThreshold ?? -1;

    if (!onEndReached && !onStartReached && autoscrollToBottomThreshold < 0) {
      return;
    }

    if (recyclerViewManager.getIsFirstLayoutComplete()) {
      const lastScrollOffset =
        recyclerViewManager.getAbsoluteLastScrollOffset();
      const contentSize = recyclerViewManager.getChildContainerDimensions();
      const windowSize = recyclerViewManager.getWindowSize();
      const isHorizontal = horizontal === true;

      // Calculate dimensions based on scroll direction
      const visibleLength = isHorizontal ? windowSize.width : windowSize.height;
      const contentLength =
        (isHorizontal ? contentSize.width : contentSize.height) +
        recyclerViewManager.firstItemOffset;

      // Check if we're near the end of the list
      if (onEndReached) {
        const onEndReachedThreshold = onEndReachedThresholdProp ?? 0.5;
        const endThresholdDistance = onEndReachedThreshold * visibleLength;

        const isNearEnd =
          Math.ceil(lastScrollOffset + visibleLength) >=
          contentLength - endThresholdDistance;

        if (isNearEnd && !pendingEndReached.current) {
          pendingEndReached.current = true;
          onEndReached();
        }
        pendingEndReached.current = isNearEnd;
      }

      // Check if we're near the start of the list
      if (onStartReached) {
        const onStartReachedThreshold = onStartReachedThresholdProp ?? 0.2;
        const startThresholdDistance = onStartReachedThreshold * visibleLength;

        const isNearStart = lastScrollOffset <= startThresholdDistance;

        if (isNearStart && !pendingStartReached.current) {
          pendingStartReached.current = true;
          onStartReached();
        }
        pendingStartReached.current = isNearStart;
      }

      // Handle auto-scrolling to bottom for vertical lists
      if (!isHorizontal && autoscrollToBottomThreshold >= 0) {
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
  }, [recyclerViewManager]);

  const runAutoScrollToBottomCheck = useCallback(() => {
    if (pendingAutoscrollToBottom.current) {
      pendingAutoscrollToBottom.current = false;
      requestAnimationFrame(() => {
        const shouldAnimate =
          recyclerViewManager.props.maintainVisibleContentPosition
            ?.animateAutoScrollToBottom ?? true;
        scrollViewRef.current?.scrollToEnd({
          animated: shouldAnimate,
        });
      });
    }
  }, [requestAnimationFrame, scrollViewRef, recyclerViewManager]);

  // Reset end reached state when data changes
  useMemo(() => {
    pendingEndReached.current = false;
    // needs to run only when data changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Auto-scroll to bottom when new content is added and we're near the bottom
  useEffect(() => {
    runAutoScrollToBottomCheck();
  }, [data, runAutoScrollToBottomCheck, windowHeight, windowWidth]);

  // Since content changes frequently, we try and avoid doing the auto scroll during active scrolls
  useEffect(() => {
    if (Date.now() - lastCheckBoundsTime.current >= 100) {
      runAutoScrollToBottomCheck();
    }
  }, [
    contentHeight,
    contentWidth,
    recyclerViewManager.firstItemOffset,
    runAutoScrollToBottomCheck,
  ]);

  return {
    checkBounds,
  };
}
