import { useEffect, useMemo, useState } from "react";

import { RecyclerViewProps } from "../RecyclerViewProps";
import { RecyclerViewManager } from "../RecyclerViewManager";
import { VelocityTracker } from "../helpers/VelocityTracker";

export const useRecyclerViewManager = <T>(props: RecyclerViewProps<T>) => {
  const [recyclerViewManager] = useState<RecyclerViewManager<T>>(
    () => new RecyclerViewManager(props)
  );
  const [velocityTracker] = useState(() => new VelocityTracker());

  const { data } = props;

  useMemo(() => {
    recyclerViewManager.updateProps(props);
  }, [props]);

  /**
   * When data changes, we need to process the data update before the render happens
   */
  useMemo(() => {
    recyclerViewManager.processDataUpdate();
  }, [data]);

  useEffect(() => {
    return () => {
      recyclerViewManager.dispose();
      velocityTracker.cleanUp();
    };
  }, []);

  return { recyclerViewManager, velocityTracker };
};
