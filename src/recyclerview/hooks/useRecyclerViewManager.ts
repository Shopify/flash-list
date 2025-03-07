import { useState } from "react";

import { RecyclerViewProps } from "../RecyclerViewProps";
import { RecyclerViewManager } from "../RecyclerViewManager";

export const useRecyclerViewManager = <T>(props: RecyclerViewProps<T>) => {
  const [renderStack, setRenderStack] = useState<Map<number, string>>(
    new Map()
  );
  const [recyclerViewManager] = useState<RecyclerViewManager<T>>(
    () =>
      new RecyclerViewManager(
        // when render stack changes
        setRenderStack,
        props
      )
  );

  recyclerViewManager.updateProps(props);

  return { recyclerViewManager, renderStack };
};
