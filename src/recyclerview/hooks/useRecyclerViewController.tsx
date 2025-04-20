import {
  RefObject,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { I18nManager } from "react-native";

import { RecyclerViewProps } from "../RecyclerViewProps";
import { CompatScroller } from "../components/CompatScroller";
import { RecyclerViewManager } from "../RecyclerViewManager";
import { adjustOffsetForRTL } from "../utils/adjustOffsetForRTL";
import { RVLayout } from "../layout-managers/LayoutManager";
import { ScrollAnchorRef } from "../components/ScrollAnchor";

import { useUnmountFlag } from "./useUnmountFlag";

/**
 * Parameters for scrolling to a specific position in the list.
 * Extends ScrollToEdgeParams to include view positioning options.
 */
export interface ScrollToParams extends ScrollToEdgeParams {
  /** Position of the target item relative to the viewport (0 = top, 0.5 = center, 1 = bottom) */
  viewPosition?: number;
  /** Additional offset to apply after viewPosition calculation */
  viewOffset?: number;
}

/**
 * Parameters for scrolling to a specific offset in the list.
 * Used when you want to scroll to an exact pixel position.
 */
export interface ScrollToOffsetParams extends ScrollToParams {
  /** The pixel offset to scroll to */
  offset: number;
  /**
   * If true, the first item offset will not be added to the offset calculation.
   * First offset represents header size or top padding.
   */
  skipFirstItemOffset?: boolean;
}

/**
 * Parameters for scrolling to a specific index in the list.
 * Used when you want to scroll to a specific item by its position in the data array.
 */
export interface ScrollToIndexParams extends ScrollToParams {
  /** The index of the item to scroll to */
  index: number;
}

/**
 * Parameters for scrolling to a specific item in the list.
 * Used when you want to scroll to a specific item by its data value.
 */
export interface ScrollToItemParams<T> extends ScrollToParams {
  /** The item to scroll to */
  item: T;
}

/**
 * Base parameters for scrolling to the edges of the list.
 */
export interface ScrollToEdgeParams {
  /** Whether the scroll should be animated */
  animated?: boolean;
}

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
  ref: React.Ref<any>,
  scrollViewRef: RefObject<CompatScroller>,
  scrollAnchorRef: React.RefObject<ScrollAnchorRef>,
  props: RecyclerViewProps<T>
) {
  const { horizontal, data } = props;
  const isUnmounted = useUnmountFlag();
  const [_, setRenderId] = useState(0);
  const pauseAdjustRef = useRef(false);
  const initialScrollCompletedRef = useRef(false);
  const lastDataLengthRef = useRef(data?.length ?? 0);

  // Track the first visible item for maintaining scroll position
  const firstVisibleItemKey = useRef<string | undefined>(undefined);
  const firstVisibleItemLayout = useRef<RVLayout | undefined>(undefined);
  const pendingScrollResolves = useRef<(() => void)[]>([]);

  const applyInitialScrollIndex = useCallback(() => {
    const initialScrollIndex =
      recyclerViewManager.getInitialScrollIndex() ?? -1;
    const dataLength = props.data?.length ?? 0;
    if (
      initialScrollIndex >= 0 &&
      initialScrollIndex < dataLength &&
      !initialScrollCompletedRef.current &&
      recyclerViewManager.getIsFirstLayoutComplete()
    ) {
      // Use setTimeout to ensure that we keep trying to scroll on first few renders
      setTimeout(() => {
        initialScrollCompletedRef.current = true;
        pauseAdjustRef.current = false;
      }, 100);

      pauseAdjustRef.current = true;

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
  }, [recyclerViewManager, props.data]);

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
    // Resolve all pending scroll updates from previous calls
    const resolves = pendingScrollResolves.current;
    pendingScrollResolves.current = [];
    resolves.forEach((resolve) => resolve());

    const currentDataLength = props.data?.length ?? 0;

    if (
      !props.horizontal &&
      recyclerViewManager.getIsFirstLayoutComplete() &&
      props.keyExtractor &&
      currentDataLength > 0 &&
      props.maintainVisibleContentPosition?.disabled !== true
    ) {
      const shouldScanData = currentDataLength !== lastDataLengthRef.current;
      // If we have a tracked first visible item, maintain its position
      if (firstVisibleItemKey.current) {
        const currentIndexOfFirstVisibleItem =
          recyclerViewManager
            .getEngagedIndices()
            .findValue(
              (index) =>
                props.keyExtractor?.(props.data![index], index) ===
                firstVisibleItemKey.current
            ) ??
          (shouldScanData
            ? props.data?.findIndex(
                (item, index) =>
                  props.keyExtractor?.(item, index) ===
                  firstVisibleItemKey.current
              )
            : undefined);

        if (currentIndexOfFirstVisibleItem !== undefined) {
          // Calculate the difference in position and apply the offset
          const diff =
            recyclerViewManager.getLayout(currentIndexOfFirstVisibleItem).y -
            firstVisibleItemLayout.current!.y;
          firstVisibleItemLayout.current = {
            ...recyclerViewManager.getLayout(currentIndexOfFirstVisibleItem),
          };
          if (diff !== 0 && !pauseAdjustRef.current) {
            // console.log("diff", diff, firstVisibleItemKey.current);
            scrollAnchorRef.current?.scrollBy(diff);
            updateScrollOffsetAsync(
              recyclerViewManager.getAbsoluteLastScrollOffset() + diff
            );
          }
        }
      }

      // Update the tracked first visible item
      const firstVisibleIndex = Math.max(
        0,
        recyclerViewManager.getVisibleIndices().startIndex
      );
      if (firstVisibleIndex !== undefined && firstVisibleIndex >= 0) {
        firstVisibleItemKey.current = props.keyExtractor(
          props.data![firstVisibleIndex],
          firstVisibleIndex
        );
        firstVisibleItemLayout.current = {
          ...recyclerViewManager.getLayout(firstVisibleIndex),
        };
      }
    }
    lastDataLengthRef.current = props.data?.length ?? 0;
  }, [props.data, props.keyExtractor, recyclerViewManager]);

  const handlerMethods = useMemo(() => {
    return {
      props,
      /**
       * Scrolls the list to a specific offset position.
       * Handles RTL layouts and first item offset adjustments.
       */
      scrollToOffset: ({
        offset,
        animated,
        skipFirstItemOffset = true,
      }: ScrollToOffsetParams) => {
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
        if (data && data.length > 0) {
          await handlerMethods.scrollToIndex({
            index: data.length - 1,
            animated,
          });
        }
        scrollViewRef.current!.scrollToEnd({ animated });
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
        if (scrollViewRef.current && data && data.length > index) {
          pauseAdjustRef.current = true;

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
            return finalOffset;
          };
          let lastScrollOffset = recyclerViewManager.getLastScrollOffset();
          let finalOffset = getFinalOffset();
          const bufferForScroll = horizontal
            ? recyclerViewManager.getWindowSize().width
            : recyclerViewManager.getWindowSize().height;

          const bufferForCompute = bufferForScroll * 2;

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

          if (animated) {
            // go from finalOffset to lastScrollOffset in 5 steps
            for (let i = 0; i < 5; i++) {
              if (isUnmounted.current) {
                return;
              }
              await updateScrollOffsetAsync(
                finalOffset + (lastScrollOffset - finalOffset) * (i / 4)
              );
            }
          } else {
            // go from lastScrollOffset to finalOffset in 5 steps
            for (let i = 0; i < 5; i++) {
              if (isUnmounted.current) {
                return;
              }
              await updateScrollOffsetAsync(
                lastScrollOffset + (finalOffset - lastScrollOffset) * (i / 4)
              );
            }
          }
          finalOffset = getFinalOffset();
          const maxOffset = recyclerViewManager.getMaxScrollOffset();

          if (finalOffset > maxOffset) {
            finalOffset = maxOffset;
          }
          if (animated) {
            // We don't need to add firstItemOffset here as it will be added in scrollToOffset
            handlerMethods.scrollToOffset({
              offset: lastScrollOffset,
              animated: false,
              skipFirstItemOffset: false,
            });
          }
          handlerMethods.scrollToOffset({
            offset: finalOffset,
            animated,
            skipFirstItemOffset: false,
          });

          setTimeout(() => {
            pauseAdjustRef.current = false;
          }, 200);
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
        if (scrollViewRef.current && data) {
          // Find the index of the item in the data array
          const index = Array.from(data).findIndex(
            (dataItem) => dataItem === item
          );
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
        return recyclerViewManager.getLayout(index);
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
      getVisibleIndices: () => {
        return recyclerViewManager.getVisibleIndices();
      },
      getFirstVisibleIndex: () => {
        return recyclerViewManager.getVisibleIndices().startIndex;
      },
      recomputeViewableItems: () => {
        recyclerViewManager.recomputeViewableItems();
      },
      /**
       * Disables item recycling in preparation for layout animations.
       */
      prepareForLayoutAnimationRender: () => {
        recyclerViewManager.disableRecycling = true;
      },
    };
  }, [horizontal, data, recyclerViewManager]);

  // Expose imperative methods through the ref
  useImperativeHandle(
    ref,
    () => {
      return { ...scrollViewRef.current, ...handlerMethods };
    },
    [handlerMethods]
  );

  return { applyContentOffset, applyInitialScrollIndex };
}
