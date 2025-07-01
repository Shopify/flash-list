import {
  RefObject,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { I18nManager } from "react-native";

import {
  ScrollToOffsetParams,
  ScrollToIndexParams,
  ScrollToItemParams,
  ScrollToEdgeParams,
  FlashListRef,
} from "../../FlashListRef";
import { CompatScroller } from "../components/CompatScroller";
import { RecyclerViewManager } from "../RecyclerViewManager";
import { adjustOffsetForRTL } from "../utils/adjustOffsetForRTL";
import { RVLayout } from "../layout-managers/LayoutManager";
import { ScrollAnchorRef } from "../components/ScrollAnchor";
import { PlatformConfig } from "../../native/config/PlatformHelper";
import { WarningMessages } from "../../errors/WarningMessages";

import { useUnmountFlag } from "./useUnmountFlag";
import { useUnmountAwareTimeout } from "./useUnmountAwareCallbacks";

/**
 * Comprehensive hook that manages RecyclerView scrolling behavior and provides
 * imperative methods for controlling the RecyclerView.
 *
 * This hook combines content offset management and scroll handling functionality:
 * 1. Provides imperative methods for scrolling and measurement
 * 2. Handles initial scroll position when the list first loads
 * 3. Maintains visible content position during updates
 * 4. Manages scroll anchors for chat-like applications
 *
 * @param recyclerViewManager - The RecyclerViewManager instance that handles core functionality
 * @param ref - The ref to expose the imperative methods
 * @param scrollViewRef - Reference to the scrollable container component
 * @param scrollAnchorRef - Reference to the scroll anchor component
 * @param props - The RecyclerViewProps containing configuration
 */
export function useRecyclerViewController<T>(
  recyclerViewManager: RecyclerViewManager<T>,
  ref: React.Ref<FlashListRef<T>>,
  scrollViewRef: RefObject<CompatScroller>,
  scrollAnchorRef: React.RefObject<ScrollAnchorRef>
) {
  const isUnmounted = useUnmountFlag();
  const [_, setRenderId] = useState(0);
  const pauseOffsetCorrection = useRef(false);
  const initialScrollCompletedRef = useRef(false);
  const lastDataLengthRef = useRef(recyclerViewManager.getDataLength());
  const { setTimeout } = useUnmountAwareTimeout();

  // Track the first visible item for maintaining scroll position
  const firstVisibleItemKey = useRef<string | undefined>(undefined);
  const firstVisibleItemLayout = useRef<RVLayout | undefined>(undefined);

  // Queue to store callbacks that should be executed after scroll offset updates
  const pendingScrollCallbacks = useRef<(() => void)[]>([]);

  // Handle initial scroll position when the list first loads
  //   useOnLoad(recyclerViewManager, () => {

  //   });
  /**
   * Updates the scroll offset and calls the provided callback
   * after the update has been applied and the component has re-rendered.
   *
   * @param offset - The new scroll offset to apply
   * @param callback - Optional callback to execute after the update is applied
   */
  const updateScrollOffsetWithCallback = useCallback(
    (offset: number, callback: () => void): void => {
      // Attempt to update the scroll offset in the RecyclerViewManager
      // This returns undefined if no update is needed
      if (recyclerViewManager.updateScrollOffset(offset) !== undefined) {
        // It will be executed after the next render
        pendingScrollCallbacks.current.push(callback);
        // Trigger a re-render to apply the scroll offset update
        setRenderId((prev) => prev + 1);
      } else {
        // No update needed, execute callback immediately
        callback();
      }
    },
    [recyclerViewManager]
  );

  const computeFirstVisibleIndexForOffsetCorrection = useCallback(() => {
    if (
      recyclerViewManager.getIsFirstLayoutComplete() &&
      recyclerViewManager.hasStableDataKeys() &&
      recyclerViewManager.getDataLength() > 0 &&
      recyclerViewManager.shouldMaintainVisibleContentPosition()
    ) {
      // Update the tracked first visible item
      const firstVisibleIndex = Math.max(
        0,
        recyclerViewManager.computeVisibleIndices().startIndex
      );
      if (firstVisibleIndex !== undefined && firstVisibleIndex >= 0) {
        firstVisibleItemKey.current =
          recyclerViewManager.getDataKey(firstVisibleIndex);
        firstVisibleItemLayout.current = {
          ...recyclerViewManager.getLayout(firstVisibleIndex),
        };
      }
    }
  }, [recyclerViewManager]);

  /**
   * Maintains the visible content position when the list updates.
   * This is particularly useful for chat applications where we want to keep
   * the user's current view position when new messages are added.
   */
  const applyOffsetCorrection = useCallback(() => {
    const { horizontal, data } = recyclerViewManager.props;

    // Execute all pending callbacks from previous scroll offset updates
    // This ensures any scroll operations that were waiting for render are completed
    const callbacks = pendingScrollCallbacks.current;
    pendingScrollCallbacks.current = [];
    callbacks.forEach((callback) => callback());

    const currentDataLength = recyclerViewManager.getDataLength();

    if (
      recyclerViewManager.getIsFirstLayoutComplete() &&
      recyclerViewManager.hasStableDataKeys() &&
      currentDataLength > 0 &&
      recyclerViewManager.shouldMaintainVisibleContentPosition()
    ) {
      const hasDataChanged = currentDataLength !== lastDataLengthRef.current;
      // If we have a tracked first visible item, maintain its position
      if (firstVisibleItemKey.current) {
        const currentIndexOfFirstVisibleItem =
          recyclerViewManager
            .getEngagedIndices()
            .findValue(
              (index) =>
                recyclerViewManager.getDataKey(index) ===
                firstVisibleItemKey.current
            ) ??
          (hasDataChanged
            ? data?.findIndex(
                (item, index) =>
                  recyclerViewManager.getDataKey(index) ===
                  firstVisibleItemKey.current
              )
            : undefined);

        if (
          currentIndexOfFirstVisibleItem !== undefined &&
          currentIndexOfFirstVisibleItem >= 0
        ) {
          // Calculate the difference in position and apply the offset
          const diff = horizontal
            ? recyclerViewManager.getLayout(currentIndexOfFirstVisibleItem).x -
              firstVisibleItemLayout.current!.x
            : recyclerViewManager.getLayout(currentIndexOfFirstVisibleItem).y -
              firstVisibleItemLayout.current!.y;
          firstVisibleItemLayout.current = {
            ...recyclerViewManager.getLayout(currentIndexOfFirstVisibleItem),
          };
          if (
            diff !== 0 &&
            !pauseOffsetCorrection.current &&
            !recyclerViewManager.animationOptimizationsEnabled
          ) {
            // console.log("diff", diff, firstVisibleItemKey.current);
            if (PlatformConfig.supportsOffsetCorrection) {
              // console.log("scrollBy", diff);
              scrollAnchorRef.current?.scrollBy(diff);
            } else {
              const scrollToParams = horizontal
                ? {
                    x: recyclerViewManager.getAbsoluteLastScrollOffset() + diff,
                    animated: false,
                  }
                : {
                    y: recyclerViewManager.getAbsoluteLastScrollOffset() + diff,
                    animated: false,
                  };
              scrollViewRef.current?.scrollTo(scrollToParams);
            }
            if (hasDataChanged) {
              updateScrollOffsetWithCallback(
                recyclerViewManager.getAbsoluteLastScrollOffset() + diff,
                () => {}
              );
              recyclerViewManager.ignoreScrollEvents = true;
              setTimeout(() => {
                recyclerViewManager.ignoreScrollEvents = false;
              }, 100);
            }
          }
        }
      }

      computeFirstVisibleIndexForOffsetCorrection();
    }
    lastDataLengthRef.current = recyclerViewManager.getDataLength();
  }, [
    recyclerViewManager,
    scrollAnchorRef,
    scrollViewRef,
    setTimeout,
    updateScrollOffsetWithCallback,
    computeFirstVisibleIndexForOffsetCorrection,
  ]);

  const handlerMethods: FlashListRef<T> = useMemo(() => {
    return {
      get props() {
        return recyclerViewManager.props;
      },
      /**
       * Scrolls the list to a specific offset position.
       * Handles RTL layouts and first item offset adjustments.
       */
      scrollToOffset: ({
        offset,
        animated,
        skipFirstItemOffset = true,
      }: ScrollToOffsetParams) => {
        const { horizontal } = recyclerViewManager.props;
        if (scrollViewRef.current) {
          // Adjust offset for RTL layouts in horizontal mode
          if (I18nManager.isRTL && horizontal) {
            // eslint-disable-next-line no-param-reassign
            offset =
              adjustOffsetForRTL(
                offset,
                recyclerViewManager.getChildContainerDimensions().width,
                recyclerViewManager.getWindowSize().width
              ) +
              (skipFirstItemOffset
                ? recyclerViewManager.firstItemOffset
                : -recyclerViewManager.firstItemOffset);
          }

          // Calculate the final offset including first item offset if needed
          const adjustedOffset =
            offset +
            (skipFirstItemOffset ? 0 : recyclerViewManager.firstItemOffset);
          const scrollTo = horizontal
            ? { x: adjustedOffset, y: 0 }
            : { x: 0, y: adjustedOffset };
          scrollViewRef.current.scrollTo({
            ...scrollTo,
            animated,
          });
        }
      },
      clearLayoutCacheOnUpdate: () => {
        recyclerViewManager.markLayoutManagerDirty();
      },

      // Expose native scroll view methods
      flashScrollIndicators: () => {
        scrollViewRef.current!.flashScrollIndicators();
      },
      getNativeScrollRef: () => {
        return scrollViewRef.current;
      },
      getScrollResponder: () => {
        return scrollViewRef.current!.getScrollResponder();
      },
      getScrollableNode: () => {
        return scrollViewRef.current!.getScrollableNode();
      },

      /**
       * Scrolls to the end of the list.
       */
      scrollToEnd: async ({ animated }: ScrollToEdgeParams = {}) => {
        const { data } = recyclerViewManager.props;
        if (data && data.length > 0) {
          const lastIndex = data.length - 1;
          if (!recyclerViewManager.getEngagedIndices().includes(lastIndex)) {
            await handlerMethods.scrollToIndex({
              index: lastIndex,
              animated,
            });
          }
        }
        setTimeout(() => {
          scrollViewRef.current!.scrollToEnd({ animated });
        }, 0);
      },

      /**
       * Scrolls to the beginning of the list.
       */
      scrollToTop: ({ animated }: ScrollToEdgeParams = {}) => {
        handlerMethods.scrollToOffset({
          offset: 0,
          animated,
        });
      },

      /**
       * Scrolls to a specific index in the list.
       * Supports viewPosition and viewOffset for precise positioning.
       * Returns a Promise that resolves when the scroll is complete.
       */
      scrollToIndex: ({
        index,
        animated,
        viewPosition,
        viewOffset,
      }: ScrollToIndexParams): Promise<void> => {
        return new Promise((resolve) => {
          const { horizontal } = recyclerViewManager.props;
          if (
            scrollViewRef.current &&
            index >= 0 &&
            index < recyclerViewManager.getDataLength()
          ) {
            // Pause the scroll offset adjustments
            pauseOffsetCorrection.current = true;
            recyclerViewManager.setOffsetProjectionEnabled(false);

            const getFinalOffset = () => {
              const layout = recyclerViewManager.getLayout(index);
              const offset = horizontal ? layout.x : layout.y;
              let finalOffset = offset;
              // take viewPosition etc into account
              if (viewPosition !== undefined || viewOffset !== undefined) {
                const containerSize = horizontal
                  ? recyclerViewManager.getWindowSize().width
                  : recyclerViewManager.getWindowSize().height;

                const itemSize = horizontal ? layout.width : layout.height;

                if (viewPosition !== undefined) {
                  // viewPosition: 0 = top, 0.5 = center, 1 = bottom
                  finalOffset =
                    offset - (containerSize - itemSize) * viewPosition;
                }

                if (viewOffset !== undefined) {
                  finalOffset += viewOffset;
                }
              }
              return finalOffset + recyclerViewManager.firstItemOffset;
            };
            const lastAbsoluteScrollOffset =
              recyclerViewManager.getAbsoluteLastScrollOffset();
            const bufferForScroll = horizontal
              ? recyclerViewManager.getWindowSize().width
              : recyclerViewManager.getWindowSize().height;

            const bufferForCompute = bufferForScroll * 2;

            const getStartScrollOffset = () => {
              let lastScrollOffset = lastAbsoluteScrollOffset;
              const finalOffset = getFinalOffset();

              if (finalOffset > lastScrollOffset) {
                lastScrollOffset = Math.max(
                  finalOffset - bufferForCompute,
                  lastScrollOffset
                );
                recyclerViewManager.setScrollDirection("forward");
              } else {
                lastScrollOffset = Math.min(
                  finalOffset + bufferForCompute,
                  lastScrollOffset
                );
                recyclerViewManager.setScrollDirection("backward");
              }
              return lastScrollOffset;
            };
            let initialTargetOffset = getFinalOffset();
            let initialStartScrollOffset = getStartScrollOffset();
            let finalOffset = initialTargetOffset;
            let startScrollOffset = initialStartScrollOffset;

            const steps = 5;

            /**
             * Recursively performs the scroll animation steps.
             * This function replaces the async/await loop with callback-based execution.
             *
             * @param currentStep - The current step in the animation (0 to steps-1)
             */
            const performScrollStep = (currentStep: number) => {
              // Check if component is unmounted or we've completed all steps
              if (isUnmounted.current) {
                resolve();
                return;
              } else if (currentStep >= steps) {
                // All steps completed, perform final scroll
                finishScrollToIndex();
                return;
              }

              // Calculate the offset for this step
              // For animated scrolls: interpolate from finalOffset to startScrollOffset
              // For non-animated: interpolate from startScrollOffset to finalOffset
              const nextOffset = animated
                ? finalOffset +
                  (startScrollOffset - finalOffset) *
                    (currentStep / (steps - 1))
                : startScrollOffset +
                  (finalOffset - startScrollOffset) *
                    (currentStep / (steps - 1));

              // Update scroll offset with a callback to continue to the next step
              updateScrollOffsetWithCallback(nextOffset, () => {
                // Check if the index is still valid after the update
                if (index >= recyclerViewManager.getDataLength()) {
                  // Index out of bounds, scroll to end instead
                  handlerMethods.scrollToEnd({ animated });
                  resolve(); // Resolve the promise as we're done
                  return;
                }

                // Check if the target position has changed significantly
                const newFinalOffset = getFinalOffset();
                if (
                  (newFinalOffset < initialTargetOffset &&
                    newFinalOffset < initialStartScrollOffset) ||
                  (newFinalOffset > initialTargetOffset &&
                    newFinalOffset > initialStartScrollOffset)
                ) {
                  // Target has moved, recalculate and restart from beginning
                  finalOffset = newFinalOffset;
                  startScrollOffset = getStartScrollOffset();
                  initialTargetOffset = newFinalOffset;
                  initialStartScrollOffset = startScrollOffset;
                  performScrollStep(0); // Restart from step 0
                } else {
                  // Continue to next step
                  performScrollStep(currentStep + 1);
                }
              });
            };

            /**
             * Completes the scroll to index operation by performing the final scroll
             * and re-enabling offset correction after a delay.
             */
            const finishScrollToIndex = () => {
              finalOffset = getFinalOffset();
              const maxOffset = recyclerViewManager.getMaxScrollOffset();

              if (finalOffset > maxOffset) {
                finalOffset = maxOffset;
              }

              if (animated) {
                // For animated scrolls, first jump to the start position
                // We don't need to add firstItemOffset here as it's already added
                handlerMethods.scrollToOffset({
                  offset: startScrollOffset,
                  animated: false,
                  skipFirstItemOffset: true,
                });
              }

              // Perform the final scroll to the target position
              handlerMethods.scrollToOffset({
                offset: finalOffset,
                animated,
                skipFirstItemOffset: true,
              });

              // Re-enable offset correction after a delay
              // Longer delay for animated scrolls to allow animation to complete
              setTimeout(
                () => {
                  pauseOffsetCorrection.current = false;
                  recyclerViewManager.setOffsetProjectionEnabled(true);
                  resolve(); // Resolve the promise after re-enabling corrections
                },
                animated ? 300 : 200
              );
            };

            // Start the scroll animation process
            performScrollStep(0);
          } else {
            // Invalid parameters, resolve immediately
            resolve();
          }
        });
      },

      /**
       * Scrolls to a specific item in the list.
       * Finds the item's index and uses scrollToIndex internally.
       */
      scrollToItem: ({
        item,
        animated,
        viewPosition,
        viewOffset,
      }: ScrollToItemParams<T>) => {
        const { data } = recyclerViewManager.props;
        if (scrollViewRef.current && data) {
          // Find the index of the item in the data array
          const index = data.findIndex((dataItem) => dataItem === item);
          if (index >= 0) {
            handlerMethods.scrollToIndex({
              index,
              animated,
              viewPosition,
              viewOffset,
            });
          }
        }
      },

      // Utility methods for measuring header height / top padding
      getFirstItemOffset: () => {
        return recyclerViewManager.firstItemOffset;
      },
      getWindowSize: () => {
        return recyclerViewManager.getWindowSize();
      },
      getLayout: (index: number) => {
        return recyclerViewManager.tryGetLayout(index);
      },
      getAbsoluteLastScrollOffset: () => {
        return recyclerViewManager.getAbsoluteLastScrollOffset();
      },
      getChildContainerDimensions: () => {
        return recyclerViewManager.getChildContainerDimensions();
      },
      recordInteraction: () => {
        recyclerViewManager.recordInteraction();
      },
      computeVisibleIndices: () => {
        return recyclerViewManager.computeVisibleIndices();
      },
      getFirstVisibleIndex: () => {
        return recyclerViewManager.computeVisibleIndices().startIndex;
      },
      recomputeViewableItems: () => {
        recyclerViewManager.recomputeViewableItems();
      },
      /**
       * Disables item recycling in preparation for layout animations.
       */
      prepareForLayoutAnimationRender: () => {
        if (!recyclerViewManager.props.keyExtractor) {
          console.warn(WarningMessages.keyExtractorNotDefinedForAnimation);
        }
        recyclerViewManager.animationOptimizationsEnabled = true;
      },
    };
  }, [
    recyclerViewManager,
    scrollViewRef,
    setTimeout,
    isUnmounted,
    updateScrollOffsetWithCallback,
  ]);

  const applyInitialScrollIndex = useCallback(() => {
    const { horizontal, data } = recyclerViewManager.props;

    const initialScrollIndex =
      recyclerViewManager.getInitialScrollIndex() ?? -1;
    const dataLength = data?.length ?? 0;
    if (
      initialScrollIndex >= 0 &&
      initialScrollIndex < dataLength &&
      !initialScrollCompletedRef.current &&
      recyclerViewManager.getIsFirstLayoutComplete()
    ) {
      // Use setTimeout to ensure that we keep trying to scroll on first few renders
      setTimeout(() => {
        initialScrollCompletedRef.current = true;
        pauseOffsetCorrection.current = false;
      }, 100);

      pauseOffsetCorrection.current = true;

      const offset = horizontal
        ? recyclerViewManager.getLayout(initialScrollIndex).x
        : recyclerViewManager.getLayout(initialScrollIndex).y;
      handlerMethods.scrollToOffset({
        offset,
        animated: false,
        skipFirstItemOffset: false,
      });

      setTimeout(() => {
        handlerMethods.scrollToOffset({
          offset,
          animated: false,
          skipFirstItemOffset: false,
        });
      }, 0);
    }
  }, [handlerMethods, recyclerViewManager, setTimeout]);

  // Expose imperative methods through the ref
  useImperativeHandle(
    ref,
    () => {
      const imperativeApi = { ...scrollViewRef.current, ...handlerMethods };
      // Without this the props getter from handlerMethods is evaluated during spread and
      // future updates to props are not reflected in the ref
      Object.defineProperty(imperativeApi, "props", {
        get() {
          return recyclerViewManager.props;
        },
        enumerable: true,
        configurable: true,
      });
      return imperativeApi;
    },
    [handlerMethods, scrollViewRef, recyclerViewManager]
  );

  return {
    applyOffsetCorrection,
    computeFirstVisibleIndexForOffsetCorrection,
    applyInitialScrollIndex,
    handlerMethods,
  };
}
