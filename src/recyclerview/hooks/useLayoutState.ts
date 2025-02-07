import { useState, useCallback } from "react";

import { useRecyclerViewContext } from "../RecyclerViewContextProvider";

export function useLayoutState<T>(
  initialState: T | (() => T)
): [T, (newValue: T | ((prevValue: T) => T)) => void] {
  const [state, setState] = useState<T>(initialState);
  const recyclerViewContext = useRecyclerViewContext();

  const setLayoutState = useCallback(
    (newValue: T | ((prevValue: T) => T)) => {
      setState((prevValue) =>
        typeof newValue === "function"
          ? (newValue as (prevValue: T) => T)(prevValue)
          : newValue
      );
      recyclerViewContext?.layout();
    },
    [recyclerViewContext]
  );

  return [state, setLayoutState];
}
