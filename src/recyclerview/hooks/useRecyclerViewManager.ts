import { useState } from "react";

import { RecyclerViewManager } from "../RecyclerVIewManager";
import { RecyclerViewProps } from "../RecyclerViewProps";

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

  return { recyclerViewManager, renderStack };
};
