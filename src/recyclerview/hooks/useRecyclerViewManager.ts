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
    // used to update props so rule can be disabled
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props]);

  /**
   * When data changes, we need to process the data update before the render happens
   */
  useMemo(() => {
    recyclerViewManager.processDataUpdate();
    // used to process data update so rule can be disabled
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    recyclerViewManager.restoreIfNeeded();

    return () => {
      recyclerViewManager.dispose();
      velocityTracker.cleanUp();
    };
    // Used to perform cleanup on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { recyclerViewManager, velocityTracker };
};
