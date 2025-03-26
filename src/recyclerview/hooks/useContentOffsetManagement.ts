import { useCallback, useRef } from "react";

import { RecyclerViewManager } from "../RecyclerViewManager";
import { RecyclerViewProps } from "../RecyclerViewProps";
import { useOnLoad } from "./useOnLoad";
import { useUnmountFlag } from "./useUnmountFlag";
import { RVLayout } from "../layout-managers/LayoutManager";
import { ScrollAnchorRef } from "../components/ScrollAnchor";
import { ScrollView } from "react-native";

/**
 * Hook to manage content offset and scroll position in the RecyclerView.
 * This hook handles:
 * 1. Initial scroll position when the list first loads
 * 2. Maintaining visible content position when the list updates
 * 3. Managing scroll anchors for chat-like applications
 *
 * @param recyclerViewManager - The RecyclerViewManager instance that handles the list's core functionality
 * @param props - The RecyclerViewProps containing configuration and callbacks
 * @param scrollViewRef - Reference to the scrollable container component
 * @param scrollAnchorRef - Reference to the scroll anchor component for maintaining scroll position
 */
export function useContentOffsetManagement<T>(
  recyclerViewManager: RecyclerViewManager<T>,
  props: RecyclerViewProps<T>,
  scrollViewRef: React.RefObject<ScrollView>,
  scrollAnchorRef: React.RefObject<ScrollAnchorRef>
) {
  // Track component unmount state to prevent operations after unmount
  const isUnmounted = useUnmountFlag();

  // Handle initial scroll position when the list first loads
  useOnLoad(recyclerViewManager, () => {
    const initialScrollIndex = props.initialScrollIndex ?? -1;
    const dataLength = props.data?.length ?? 0;
    if (initialScrollIndex >= 0 && initialScrollIndex < dataLength) {
      // Use setTimeout to ensure the scroll happens after layout is complete
      // TODO: Consider using a more reliable method than setTimeout
      setTimeout(() => {
        if (!isUnmounted.current) {
          scrollViewRef.current?.scrollTo({
            x:
              recyclerViewManager.getLayout(props.initialScrollIndex ?? 0).x +
              recyclerViewManager.firstItemOffset,
            y:
              recyclerViewManager.getLayout(props.initialScrollIndex ?? 0).y +
              recyclerViewManager.firstItemOffset,
            animated: false,
          });
        }
      }, 0);
    }
  });

  // Track the first visible item for maintaining scroll position
  const firstVisibleItemKey = useRef<string | undefined>(undefined);
  const firstVisibleItemLayout = useRef<RVLayout | undefined>(undefined);

  /**
   * Maintains the visible content position when the list updates.
   * This is particularly useful for chat applications where we want to keep
   * the user's current view position when new messages are added.
   */
  const applyContentOffset = useCallback(() => {
    if (
      recyclerViewManager.getIsFirstLayoutComplete() &&
      props.maintainVisibleContentPosition
    ) {
      // If we have a tracked first visible item, maintain its position
      if (firstVisibleItemKey.current) {
        const currentIndexOfFirstVisibleItem = recyclerViewManager
          .getEngagedIndices()
          .findValue(
            (index) =>
              props.keyExtractor?.(props.data![index], index) ===
              firstVisibleItemKey.current
          );

        if (currentIndexOfFirstVisibleItem !== undefined) {
          // Calculate the difference in position and apply the offset
          const diff =
            recyclerViewManager.getLayout(currentIndexOfFirstVisibleItem).y -
            firstVisibleItemLayout.current!.y;
          firstVisibleItemLayout.current = {
            ...recyclerViewManager.getLayout(currentIndexOfFirstVisibleItem),
          };
          if (diff !== 0) {
            scrollAnchorRef.current?.scrollBy(diff);
          }
        }
      }

      // Update the tracked first visible item
      const firstVisibleIndex =
        recyclerViewManager.getEngagedIndices().startIndex;
      if (firstVisibleIndex !== undefined) {
        firstVisibleItemKey.current =
          props.keyExtractor?.(
            props.data![firstVisibleIndex],
            firstVisibleIndex
          ) ?? "0";
        firstVisibleItemLayout.current = {
          ...recyclerViewManager.getLayout(firstVisibleIndex),
        };
      }
    }
  }, [props.data, props.keyExtractor, recyclerViewManager]);

  return { applyContentOffset };
}
