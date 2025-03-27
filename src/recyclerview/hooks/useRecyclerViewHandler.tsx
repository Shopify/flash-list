import { RefObject, useImperativeHandle } from "react";
import { RecyclerViewProps } from "../RecyclerViewProps";
import { CompatScroller } from "../components/CompatScroller";
import { RecyclerViewManager } from "../RecyclerViewManager";
import { I18nManager } from "react-native";
import { adjustOffsetForRTL } from "../utils/adjustOffsetForRTL";
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
 * Hook that provides imperative methods for controlling the RecyclerView.
 * This hook exposes a comprehensive set of methods for scrolling, measuring,
 * and managing the RecyclerView's state.
 *
 * @param recyclerViewManager - The RecyclerViewManager instance that handles core functionality
 * @param ref - The ref to expose the imperative methods
 * @param scrollViewRef - Reference to the scrollable container component
 * @param props - The RecyclerViewProps containing configuration
 */
export function useRecyclerViewHandler<T>(
  recyclerViewManager: RecyclerViewManager<T>,
  ref: React.Ref<any>,
  scrollViewRef: RefObject<CompatScroller>,
  updateScrollOffsetAsync: (offset: number) => Promise<void>,
  props: RecyclerViewProps<T>
) {
  const { horizontal, data } = props;
  const isUnmounted = useUnmountFlag();

  useImperativeHandle(
    ref,
    () => {
      // Create an object with all methods that will be exposed through the ref
      const methods = {
        ...scrollViewRef.current, // TODO: evaluate if this will need to any issues
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
              offset = adjustOffsetForRTL(
                offset,
                recyclerViewManager.getChildContainerDimensions().width,
                recyclerViewManager.getWindowSize().width
              );
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
        scrollToEnd: ({ animated }: ScrollToEdgeParams = {}) => {
          scrollViewRef.current!.scrollToEnd({ animated });
        },

        /**
         * Scrolls to the beginning of the list.
         */
        scrollToTop: ({ animated }: ScrollToEdgeParams = {}) => {
          methods.scrollToOffset({
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
            const layout = recyclerViewManager.getLayout(index);
            let lastScrollOffset = recyclerViewManager.getLastScrollOffset();
            if (layout) {
              let prevFinalOffset = Number.POSITIVE_INFINITY;
              let finalOffset = 0;
              let attempts = 0;
              const MAX_ATTEMPTS = 5;
              const OFFSET_TOLERANCE = 1; // 1px tolerance

              do {
                const layout = recyclerViewManager.getLayout(index);
                if (!layout || isUnmounted.current) break;

                const offset = horizontal ? layout.x : layout.y;
                finalOffset = offset;

                // Apply viewPosition and viewOffset adjustments if provided
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

                // Check if offset has stabilized
                if (
                  Math.abs(prevFinalOffset - finalOffset) <= OFFSET_TOLERANCE
                ) {
                  break;
                }

                prevFinalOffset = finalOffset;
                await updateScrollOffsetAsync(finalOffset);
                console.log("finalOffset", finalOffset);

                //recyclerViewManager.updateScrollOffset(finalOffset);
                attempts++;
              } while (attempts < MAX_ATTEMPTS);

              if (animated) {
                if (finalOffset > lastScrollOffset) {
                  lastScrollOffset = Math.max(
                    finalOffset - 500,
                    lastScrollOffset
                  );
                } else {
                  lastScrollOffset = Math.min(
                    finalOffset + 500,
                    lastScrollOffset
                  );
                }

                //We don't need to add firstItemOffset here as it will be added in scrollToOffset
                methods.scrollToOffset({
                  offset: lastScrollOffset,
                  animated: false,
                  skipFirstItemOffset: false,
                });
              }
              methods.scrollToOffset({
                offset: finalOffset,
                animated,
                skipFirstItemOffset: false,
              });
            }
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
              methods.scrollToIndex({
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

      return methods;
    },
    [horizontal, data, recyclerViewManager, scrollViewRef]
  );
}
