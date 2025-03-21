import { useCallback, useRef } from "react";

import { RecyclerViewManager } from "../RecyclerViewManager";
import { RecyclerViewProps } from "../RecyclerViewProps";
import { useOnLoad } from "./useOnLoad";
import { useUnmountFlag } from "./useUnmountFlag";
import { RVLayout } from "../layout-managers/LayoutManager";
import { ScrollAnchorRef } from "../components/ScrollAnchor";
import { ScrollView } from "react-native";
export function useContentOffsetManagement<T>(
  recyclerViewManager: RecyclerViewManager<T>,
  props: RecyclerViewProps<T>,
  scrollViewRef: React.RefObject<ScrollView>,
  scrollAnchorRef: React.RefObject<ScrollAnchorRef>
) {
  const isUnmounted = useUnmountFlag();

  useOnLoad(recyclerViewManager, () => {
    const initialScrollIndex = props.initialScrollIndex ?? -1;
    const dataLength = props.data?.length ?? 0;
    if (initialScrollIndex >= 0 && initialScrollIndex < dataLength) {
      //TODO: remove setTimeout somehow
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
  // TODO: exp chat app support. Needs to be polished.

  const firstVisibleItemKey = useRef<string | undefined>(undefined);
  const firstVisibleItemLayout = useRef<RVLayout | undefined>(undefined);
  const applyContentOffset = useCallback(() => {
    if (
      recyclerViewManager.getIsFirstLayoutComplete() &&
      props.maintainVisibleContentPosition
    ) {
      if (firstVisibleItemKey.current) {
        const currentIndexOfFirstVisibleItem = recyclerViewManager
          .getEngagedIndices()
          .findValue(
            (index) =>
              props.keyExtractor?.(props.data![index], index) ===
              firstVisibleItemKey.current
          );

        if (currentIndexOfFirstVisibleItem !== undefined) {
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
