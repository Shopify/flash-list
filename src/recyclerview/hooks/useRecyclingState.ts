import { useCallback, useMemo, useRef } from "react";

import { LayoutStateSetter, useLayoutState } from "./useLayoutState";

export type RecyclingStateSetter<T> = LayoutStateSetter<T>;

export type RecyclingStateInitialValue<T> = T | (() => T);

/**
 * A custom hook that provides state management with automatic reset functionality.
 * Similar to useState, but automatically resets the state when specified dependencies change.
 * This is particularly useful for managing state that needs to be reset when certain props or values change when items are recycled.
 * This also avoids another setState call on recycling and helps with performance.
 *
 * @param initialState - The initial state value or a function that returns the initial state
 * @param deps - Array of dependencies that trigger a state reset when changed
 * @param onReset - Optional callback function that is called when the state is reset
 * @returns A tuple containing:
 *   - The current state value
 *   - A setState function that works like useState's setState
 */
export function useRecyclingState<T>(
  initialState: RecyclingStateInitialValue<T>,
  deps: React.DependencyList,
  onReset?: () => void
): [T, RecyclingStateSetter<T>] {
  // Store the current state value in a ref to persist between renders
  const valueStore = useRef<T>();
  // Use layoutState to trigger re-renders when state changes
  const [_, setCounter] = useLayoutState(0);

  // Reset state when dependencies change
  useMemo(() => {
    // Calculate initial value from function or direct value
    const initialValue =
      typeof initialState === "function"
        ? (initialState as () => T)()
        : initialState;
    valueStore.current = initialValue;
    // Call onReset callback if provided
    onReset?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  /**
   * Proxy setState function that updates the stored value and triggers a re-render.
   * Only triggers a re-render if the new value is different from the current value.
   */
  const setStateProxy: RecyclingStateSetter<T> = useCallback(
    (newValue, skipParentLayout) => {
      // Calculate next state value from function or direct value
      const nextState =
        typeof newValue === "function"
          ? (newValue as (prevValue: T) => T)(valueStore.current!)
          : newValue;

      // Only update and trigger re-render if value has changed
      if (nextState !== valueStore.current) {
        valueStore.current = nextState;
        setCounter((prev) => prev + 1, skipParentLayout);
      }
    },
    [setCounter]
  );

  return [valueStore.current!, setStateProxy];
}
