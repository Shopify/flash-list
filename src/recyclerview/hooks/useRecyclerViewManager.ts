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
    recyclerViewManager.processDataUpdate();
  }, [data]);

  useEffect(() => {
    return () => {
      recyclerViewManager.dispose();
    };
  }, []);

  return { recyclerViewManager };
};
