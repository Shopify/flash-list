import { useCallback, useState } from "react";

import { RecyclerViewManager } from "../RecyclerViewManager";
import { RecyclerViewProps } from "../RecyclerViewProps";
import { useOnLoad } from "./useOnLoad";
import { useUnmountFlag } from "./useUnmountFlag";
export function useContentOffsetManagement<T>(
  recyclerViewManager: RecyclerViewManager<T>,
  props: RecyclerViewProps<T>
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

  // const firstVisibleItemKey = useRef<string | undefined>(undefined);
  // const firstVisibleItemLayout = useRef<RVLayout | undefined>(undefined);
  const handleCommitLayoutEffect = useCallback(() => {
    // if (recyclerViewManager.getIsFirstLayoutComplete()) {
    //   if (firstVisibleItemKey.current) {
    //     const currentIndexOfFirstVisibleItem = props.data?.findIndex(
    //       (item, index) =>
    //         props.keyExtractor?.(item, index) === firstVisibleItemKey.current
    //     );
    //     if (currentIndexOfFirstVisibleItem !== undefined) {
    //       console.log(
    //         "currentIndexOfFirstVisibleItem",
    //         firstVisibleItemKey.current
    //       );
    //       const diff =
    //         firstVisibleItemLayout.current!.y -
    //         recyclerViewManager.getLayout(currentIndexOfFirstVisibleItem).y;
    //       console.log("diff", diff);
    //       firstVisibleItemLayout.current = {
    //         ...recyclerViewManager.getLayout(currentIndexOfFirstVisibleItem),
    //       };
    //       console.log("diff--------->", diff);
    //       if (diff !== 0) {
    //         setContentOffset({
    //           x: 0,
    //           y: recyclerViewManager.getLastScrollOffset() - diff,
    //         });
    //       }
    //     }
    //   }
    //   const firstVisibleIndex = recyclerViewManager.getVisibleIndices()[0];
    //   if (firstVisibleIndex !== undefined) {
    //     console.log("firstVisibleIndex", firstVisibleIndex);
    //     firstVisibleItemKey.current =
    //       props.keyExtractor?.(
    //         props.data![firstVisibleIndex],
    //         firstVisibleIndex
    //       ) ?? "0";
    //     firstVisibleItemLayout.current = {
    //       ...recyclerViewManager.getLayout(firstVisibleIndex),
    //     };
    //   }
    // }
  }, [props.data, props.keyExtractor, recyclerViewManager]);

  return { contentOffset, handleCommitLayoutEffect };
}
