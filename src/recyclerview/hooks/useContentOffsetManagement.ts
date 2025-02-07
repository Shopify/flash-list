import { useLayoutEffect, useState } from "react";

import { RecyclerViewManager } from "../RecyclerVIewManager";

export function useContentOffsetManagement<T>(
  recyclerViewManager: RecyclerViewManager<T>
) {
  const [contentOffset, setContentOffset] = useState({ x: 0, y: 0 });
  const firstVisibleItem = recyclerViewManager.hasLayout()
    ? recyclerViewManager.getVisibleIndices()[0]
    : 0;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const firstVisibleItemLayout = recyclerViewManager.hasLayout()
    ? {
        ...recyclerViewManager.getLayout(firstVisibleItem),
      }
    : undefined;
  // const firstVisibleItemKey = recyclerViewManager.getStableId(firstVisibleItem);
  useLayoutEffect(() => {
    if (!firstVisibleItemLayout) return;
    const newLayout = recyclerViewManager.getLayout(firstVisibleItem);
    if (newLayout.y !== firstVisibleItemLayout.y) {
      console.log("ContentOffset", newLayout.y, firstVisibleItemLayout.y);
      setContentOffset({
        x: 0,
        y:
          recyclerViewManager.getLastScrollOffset() +
          (newLayout.y - firstVisibleItemLayout.y),
      });
    }
  }, [firstVisibleItem, firstVisibleItemLayout, recyclerViewManager]);
  return contentOffset;
}
