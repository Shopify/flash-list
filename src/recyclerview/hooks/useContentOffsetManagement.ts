import { useCallback, useRef, useState } from "react";

import { RecyclerViewManager } from "../RecyclerViewManager";
import { RecyclerViewProps } from "../RecyclerViewProps";
import { useOnLoad } from "./useOnLoad";
import { useUnmountFlag } from "./useUnmountFlag";
import { RVLayout } from "../layout-managers/LayoutManager";
import { ScrollAnchorRef } from "../components/ScrollAnchor";
export function useContentOffsetManagement<T>(
  recyclerViewManager: RecyclerViewManager<T>,
  props: RecyclerViewProps<T>,
  scrollAnchorRef: React.RefObject<ScrollAnchorRef>
) {
  const [contentOffset, setContentOffset] = useState({ x: 0, y: 0 });
  const isUnmounted = useUnmountFlag();

  useOnLoad(recyclerViewManager, () => {
    const initialScrollIndex = props.initialScrollIndex ?? -1;
    const dataLength = props.data?.length ?? 0;
    if (initialScrollIndex >= 0 && initialScrollIndex < dataLength) {
      //TODO: remove setTimeout somehow
      setTimeout(() => {
        if (!isUnmounted.current) {
          setContentOffset({
            x:
              recyclerViewManager.getLayout(props.initialScrollIndex ?? 0).x +
              recyclerViewManager.firstItemOffset,
            y:
              recyclerViewManager.getLayout(props.initialScrollIndex ?? 0).y +
              recyclerViewManager.firstItemOffset,
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
            firstVisibleItemLayout.current!.y -
            recyclerViewManager.getLayout(currentIndexOfFirstVisibleItem).y;
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

  return { contentOffset, applyContentOffset };
}
