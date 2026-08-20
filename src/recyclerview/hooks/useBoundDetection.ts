import { useCallback, useEffect, useMemo, useRef } from "react";

import { RecyclerViewManager } from "../RecyclerViewManager";
import { CompatScroller } from "../components/CompatScroller";

import {
  useUnmountAwareAnimationFrame,
  useUnmountAwareTimeout,
} from "./useUnmountAwareCallbacks";

/**
 * How long the scroll has to stay quiet before a content size change is allowed
 * to trigger the autoscroll to bottom. Autoscrolling in the middle of an active
 * scroll fights the user, so the check waits for this gap instead.
 */
const AUTOSCROLL_QUIET_WINDOW = 100;

/**
 * Scroll offsets can come back off by a sub pixel without anything having
 * actually moved, so a deferred autoscroll treats a difference this small as
 * "nobody scrolled". A real drag covers far more than this in
 * AUTOSCROLL_QUIET_WINDOW.
 */
const AUTOSCROLL_OFFSET_TOLERANCE = 1;

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
  // Holds an autoscroll that was owed when the content size changed mid scroll,
  // along with the scroll offset at that moment so a real user scroll during the
  // wait can cancel it.
  const deferredAutoscroll = useRef<{ offset: number } | undefined>(undefined);

  const { data } = recyclerViewManager.props;
  const { requestAnimationFrame } = useUnmountAwareAnimationFrame();
  const { setTimeout } = useUnmountAwareTimeout();

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

      // Skip bound detection if the window has no measurable size.
      // This can happen when the list is mounted off-screen (e.g., in a
      // background tab) and all measurements come back as 0, which would
      // incorrectly trigger onEndReached/onStartReached.
      if (visibleLength <= 0) {
        return;
      }

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

  /**
   * @param force - run the autoscroll even though checkBounds has since cleared
   * pendingAutoscrollToBottom. Used by the deferred path, where the content
   * growing below the viewport is what put the bottom out of reach in the first
   * place.
   */
  const runAutoScrollToBottomCheck = useCallback(
    (force = false) => {
      // Suppress MVCP autoscroll while a programmatic scrollToIndex is in
      // flight. FlashList disables offset projection at the start of
      // scrollToIndex and reenables it ~200-300ms after settling. Without
      // this guard, the sticky pendingAutoscrollToBottom ref races against
      // scrollToIndex and fires scrollToEnd mid flight.
      if (!recyclerViewManager.isOffsetProjectionEnabled) {
        return;
      }
      if (force || pendingAutoscrollToBottom.current) {
        pendingAutoscrollToBottom.current = false;
        requestAnimationFrame(() => {
          const shouldAnimate =
            recyclerViewManager.props.maintainVisibleContentPosition
              ?.animateAutoScrollToBottom ?? true;
          scrollViewRef.current?.scrollToEnd({
            animated: shouldAnimate && !recyclerViewManager.ignoreScrollEvents,
          });
        });
      }
    },
    [requestAnimationFrame, scrollViewRef, recyclerViewManager]
  );

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

  /**
   * Waits out AUTOSCROLL_QUIET_WINDOW and then runs the autoscroll that the
   * content size change was owed, as long as nothing actually scrolled in the
   * meantime.
   */
  const scheduleAutoScrollRetry = useCallback(() => {
    if (!pendingAutoscrollToBottom.current || deferredAutoscroll.current) {
      return;
    }
    deferredAutoscroll.current = {
      offset: recyclerViewManager.getAbsoluteLastScrollOffset(),
    };

    setTimeout(() => {
      const deferred = deferredAutoscroll.current;
      deferredAutoscroll.current = undefined;
      if (!deferred) {
        return;
      }
      // An offset that moved means the user took over, and checkBounds has
      // already recorded whether they are still near the bottom - leave the
      // decision to it rather than yanking them back down. An offset that did
      // not move means nothing is scrolling, which is both the case autoscroll
      // exists for and proof that there is no scroll left to fight.
      if (
        Math.abs(
          recyclerViewManager.getAbsoluteLastScrollOffset() - deferred.offset
        ) > AUTOSCROLL_OFFSET_TOLERANCE
      ) {
        return;
      }
      runAutoScrollToBottomCheck(true);
    }, AUTOSCROLL_QUIET_WINDOW);
  }, [recyclerViewManager, runAutoScrollToBottomCheck, setTimeout]);

  // Since content changes frequently, we try and avoid doing the auto scroll during active scrolls
  useEffect(() => {
    if (Date.now() - lastCheckBoundsTime.current >= AUTOSCROLL_QUIET_WINDOW) {
      runAutoScrollToBottomCheck();
      return;
    }
    // The content changed while a scroll was still settling. Giving up here
    // loses the autoscroll for good: the taller content pushes the bottom out
    // of reach, so the next checkBounds clears the pending autoscroll and
    // nothing brings it back. Items measuring to their real height right after
    // new content arrives is exactly that case, which is why a list with
    // dynamic item heights stops sticking to the bottom.
    scheduleAutoScrollRetry();
  }, [
    contentHeight,
    contentWidth,
    recyclerViewManager.firstItemOffset,
    runAutoScrollToBottomCheck,
    scheduleAutoScrollRetry,
  ]);

  return {
    checkBounds,
  };
}
