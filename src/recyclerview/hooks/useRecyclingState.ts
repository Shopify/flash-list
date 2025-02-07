import { Dispatch, SetStateAction, useCallback, useMemo, useRef } from "react";

import { useLayoutState } from "./useLayoutState";

/**
 * A hook that works like useState but resets the state when dependencies change
 * @param initialState The initial state value or function
 * @param deps Dependencies array that triggers state reset when changed
 * @param onReset Callback function that is called when the state is reset
 * @returns [state, setState] tuple similar to useState
 */
export function useRecyclingState<T>(
  initialState: T | (() => T),
  deps: React.DependencyList,
  onReset?: () => void
): [T, Dispatch<SetStateAction<T>>] {
  const valueStore = useRef<T>();
  const [_, setCounter] = useLayoutState(0);

  useMemo(() => {
    const initialValue =
      typeof initialState === "function"
        ? (initialState as () => T)()
        : initialState;
    valueStore.current = initialValue;
    onReset?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const setStateProxy = useCallback(
    (newValue: T | ((prevValue: T) => T)) => {
      const nextState =
        typeof newValue === "function"
          ? (newValue as (prevValue: T) => T)(valueStore.current!)
          : newValue;

      if (nextState !== valueStore.current) {
        valueStore.current = nextState;
        setCounter((prev) => prev + 1);
      }
    },
    [setCounter]
  );

  return [valueStore.current!, setStateProxy];
}
