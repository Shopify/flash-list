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
  const lastDataLengthRef = useRef(recyclerViewManager.props.data?.length ?? 0);
  const { setTimeout } = useUnmountAwareTimeout();

  // Track the first visible item for maintaining scroll position
  const firstVisibleItemKey = useRef<string | undefined>(undefined);
  const firstVisibleItemLayout = useRef<RVLayout | undefined>(undefined);
  const pendingScrollResolves = useRef<(() => void)[]>([]);

  // Handle initial scroll position when the list first loads
  //   useOnLoad(recyclerViewManager, () => {

  //   });
  /**
   * Updates the scroll offset and returns a Promise that resolves
   * when the update has been applied.
   */
  const updateScrollOffsetAsync = useCallback(
    async (offset: number): Promise<void> => {
      return new Promise((resolve) => {
        // TODO: Make sure we don't scroll beyond content size
        if (recyclerViewManager.updateScrollOffset(offset) !== undefined) {
          // Add the resolve function to the queue
          pendingScrollResolves.current.push(resolve);
          setRenderId((prev) => prev + 1);
        } else {
          resolve();
        }
      });
    },
    [recyclerViewManager]
  );

  /**
   * Maintains the visible content position when the list updates.
   * This is particularly useful for chat applications where we want to keep
   * the user's current view position when new messages are added.
   */
  const applyContentOffset = useCallback(async () => {
    const { horizontal, data, keyExtractor } = recyclerViewManager.props;
    // Resolve all pending scroll updates from previous calls
    const resolves = pendingScrollResolves.current;
    pendingScrollResolves.current = [];
    resolves.forEach((resolve) => resolve());

    const currentDataLength = data?.length ?? 0;

    if (
      recyclerViewManager.getIsFirstLayoutComplete() &&
      keyExtractor &&
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
                keyExtractor?.(data![index], index) ===
                firstVisibleItemKey.current
            ) ??
          (hasDataChanged
            ? data?.findIndex(
                (item, index) =>
                  keyExtractor?.(item, index) === firstVisibleItemKey.current
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
          if (diff !== 0 && !pauseOffsetCorrection.current) {
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
              updateScrollOffsetAsync(
                recyclerViewManager.getAbsoluteLastScrollOffset() + diff
              );
              recyclerViewManager.ignoreScrollEvents = true;
              setTimeout(() => {
                recyclerViewManager.ignoreScrollEvents = false;
              }, 100);
            }
          }
        }
      }

      // Update the tracked first visible item
      const firstVisibleIndex = Math.max(
        0,
        recyclerViewManager.computeVisibleIndices().startIndex
      );
      if (firstVisibleIndex !== undefined && firstVisibleIndex >= 0) {
        firstVisibleItemKey.current = keyExtractor(
          data![firstVisibleIndex],
          firstVisibleIndex
        );
        firstVisibleItemLayout.current = {
          ...recyclerViewManager.getLayout(firstVisibleIndex),
        };
      }
    }
    lastDataLengthRef.current = data?.length ?? 0;
  }, [
    recyclerViewManager,
    scrollAnchorRef,
    scrollViewRef,
    setTimeout,
    updateScrollOffsetAsync,
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
          await handlerMethods.scrollToIndex({
            index: data.length - 1,
            animated,
          });
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
       */
      scrollToIndex: async ({
        index,
        animated,
        viewPosition,
        viewOffset,
      }: ScrollToIndexParams) => {
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
          // go from finalOffset to startScrollOffset in 5 steps for animated
          // otherwise go from startScrollOffset to finalOffset in 5 steps
          for (let i = 0; i < steps; i++) {
            if (isUnmounted.current) {
              return;
            }
            const nextOffset = animated
              ? finalOffset +
                (startScrollOffset - finalOffset) * (i / (steps - 1))
              : startScrollOffset +
                (finalOffset - startScrollOffset) * (i / (steps - 1));
            await updateScrollOffsetAsync(nextOffset);

            // In case some change happens in the middle of this operation
            // and the index is out of bounds, scroll to the end
            if (index >= recyclerViewManager.getDataLength()) {
              handlerMethods.scrollToEnd({ animated });
              return;
            }

            const newFinalOffset = getFinalOffset();
            if (
              (newFinalOffset < initialTargetOffset &&
                newFinalOffset < initialStartScrollOffset) ||
              (newFinalOffset > initialTargetOffset &&
                newFinalOffset > initialStartScrollOffset)
            ) {
              finalOffset = newFinalOffset;
              startScrollOffset = getStartScrollOffset();
              initialTargetOffset = newFinalOffset;
              initialStartScrollOffset = startScrollOffset;
              i = -1; // Restart compute loop
            }
          }

          finalOffset = getFinalOffset();
          const maxOffset = recyclerViewManager.getMaxScrollOffset();

          if (finalOffset > maxOffset) {
            finalOffset = maxOffset;
          }

          if (animated) {
            // We don't need to add firstItemOffset here as it's already added
            handlerMethods.scrollToOffset({
              offset: startScrollOffset,
              animated: false,
              skipFirstItemOffset: true,
            });
          }
          handlerMethods.scrollToOffset({
            offset: finalOffset,
            animated,
            skipFirstItemOffset: true,
          });

          setTimeout(
            () => {
              pauseOffsetCorrection.current = false;
              recyclerViewManager.setOffsetProjectionEnabled(true);
            },
            animated ? 300 : 200
          );
        }
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
        recyclerViewManager.disableRecycling(true);
      },
    };
  }, [
    recyclerViewManager,
    scrollViewRef,
    setTimeout,
    isUnmounted,
    updateScrollOffsetAsync,
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
      return { ...scrollViewRef.current, ...handlerMethods };
    },
    [handlerMethods, scrollViewRef]
  );

  return { applyContentOffset, applyInitialScrollIndex, handlerMethods };
}
