import { useEffect, useState } from "react";

import { RecyclerViewProps } from "../RecyclerViewProps";
import { RecyclerViewManager } from "../RecyclerViewManager";
import { VelocityTracker } from "../helpers/VelocityTracker";

export const useRecyclerViewManager = <T>(props: RecyclerViewProps<T>) => {
  const [recyclerViewManager] = useState<RecyclerViewManager<T>>(
    () => new RecyclerViewManager(props)
  );
  const [velocityTracker] = useState(() => new VelocityTracker());

  const { data } = props;

  // Compare against what the manager last saw rather than memoizing on
  // props/data: a render that React discards (Suspense, transitions,
  // useDeferredValue) has still mutated the manager, so the next committed
  // render must re-sync even when its props equal the previous commit's.
  const [lastSynced] = useState<{
    props?: RecyclerViewProps<T>;
    data?: RecyclerViewProps<T>["data"];
  }>(() => ({}));

  if (lastSynced.props !== props) {
    lastSynced.props = props;
    recyclerViewManager.updateProps(props);
  }

  // Process the data update before the render happens
  if (lastSynced.data !== data) {
    lastSynced.data = data;
    recyclerViewManager.processDataUpdate();
  }

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
