import { useEffect, useMemo, useState } from "react";

import { RecyclerViewProps } from "../RecyclerViewProps";
import { RecyclerViewManager } from "../RecyclerViewManager";

export const useRecyclerViewManager = <T>(props: RecyclerViewProps<T>) => {
  const [recyclerViewManager] = useState<RecyclerViewManager<T>>(
    () => new RecyclerViewManager(props)
  );
  const { data } = props;

  useMemo(() => {
    recyclerViewManager.updateProps(props);
  }, [props]);

  useMemo(() => {
    if (recyclerViewManager.hasLayout()) {
      recyclerViewManager.modifyChildrenLayout([], data?.length ?? 0);
    }
  }, [data]);

  useEffect(() => {
    return () => {
      recyclerViewManager.dispose();
    };
  }, []);

  return { recyclerViewManager };
};
