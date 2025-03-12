import { RefObject, useImperativeHandle } from "react";
import { RecyclerViewProps } from "../RecyclerViewProps";
import { CompatScroller } from "../components/CompatScroller";
import { RecyclerViewManager } from "../RecyclerViewManager";

export interface ScrollToParams extends ScrollToEdgeParams {
  viewPosition?: number;
  viewOffset?: number;
}
export interface ScrollToOffsetParams extends ScrollToParams {
  // The offset to scroll to
  offset: number;
  /**
   * If true, the first item offset will not be added to the offset calculation
   * First offset is header size or top padding etc.
   */
  skipFirstItemOffset?: boolean;
}

export interface ScrollToIndexParams extends ScrollToParams {
  index: number;
}

export interface ScrollToItemParams<T> extends ScrollToParams {
  item: T;
}

export interface ScrollToEdgeParams {
  animated?: boolean;
}

export function useRecyclerViewHandler<T>(
  recyclerViewManager: RecyclerViewManager<T>,
  ref: React.Ref<any>,
  scrollViewRef: RefObject<CompatScroller>,
  props: RecyclerViewProps<T>
) {
  const { horizontal, data } = props;
  const firstItemOffset = recyclerViewManager.firstItemOffset;

  useImperativeHandle(
    ref,
    () => {
      // Create an object with all methods
      const methods = {
        props,
        scrollToOffset: ({
          offset,
          animated,
          skipFirstItemOffset = true,
        }: ScrollToOffsetParams) => {
          if (scrollViewRef.current) {
            const adjustedOffset =
              offset + (skipFirstItemOffset ? 0 : firstItemOffset);
            const scrollTo = horizontal
              ? { x: adjustedOffset, y: 0 }
              : { x: 0, y: adjustedOffset };
            scrollViewRef.current.scrollTo({
              ...scrollTo,
              animated,
            });

            // Optionally handle viewPosition and viewSize if needed
            // This is a simple implementation and may require more logic depending on your needs
          }
        },
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
        scrollToEnd: ({ animated }: ScrollToEdgeParams = {}) => {
          scrollViewRef.current!.scrollToEnd({ animated });
        },
        scrollToTop: ({ animated }: ScrollToEdgeParams = {}) => {
          methods.scrollToOffset({
            offset: 0,
            animated,
          });
        },
        scrollToIndex: ({
          index,
          animated,
          viewPosition,
          viewOffset,
        }: ScrollToIndexParams) => {
          if (scrollViewRef.current && data && data.length > index) {
            // Calculate the offset to the item at the specified index
            const layout = recyclerViewManager.getLayout(index);
            if (layout) {
              const offset = horizontal ? layout.x : layout.y;

              // Apply viewPosition and viewOffset adjustments if provided
              let finalOffset = offset;

              if (viewPosition !== undefined || viewOffset !== undefined) {
                const containerSize = horizontal
                  ? recyclerViewManager.getWindowSize().width
                  : recyclerViewManager.getWindowSize().height;

                const itemSize = horizontal ? layout.width : layout.height;

                if (viewPosition !== undefined) {
                  // viewPosition: 0 means at the top, 0.5 means centered, 1 means at the bottom
                  finalOffset =
                    offset - (containerSize - itemSize) * viewPosition;
                }

                if (viewOffset !== undefined) {
                  finalOffset += viewOffset;
                }
              }

              // We don't need to add firstItemOffset here as it will be added in scrollToOffset
              methods.scrollToOffset({
                offset: finalOffset,
                animated,
                skipFirstItemOffset: false,
              });
            }
          }
        },
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
      };

      return methods;
    },
    [horizontal, data, recyclerViewManager, scrollViewRef, firstItemOffset]
  );
}
