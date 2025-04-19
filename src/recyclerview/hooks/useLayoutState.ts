import { useState, useCallback } from "react";

import { useRecyclerViewContext } from "../RecyclerViewContextProvider";

/**
 * Custom hook that combines state management with RecyclerView layout updates.
 * This hook provides a way to manage state that affects the layout of the RecyclerView,
 * ensuring that any state changes trigger a layout recalculation.
 *
 * @param initialState - The initial state value or a function that returns the initial state
 * @returns A tuple containing:
 *   - The current state value
 *   - A setter function that updates the state and triggers a layout recalculation
 */
export function useLayoutState<T>(
  initialState: T | (() => T)
): [T, (newValue: T | ((prevValue: T) => T)) => void] {
  // Initialize state with the provided initial value
  const [state, setState] = useState<T>(initialState);
  // Get the RecyclerView context for layout management
  const recyclerViewContext = useRecyclerViewContext();

  /**
   * Setter function that updates the state and triggers a layout recalculation.
   * This ensures that any state changes that affect the layout are properly reflected
   * in the RecyclerView's visual representation.
   *
   * @param newValue - Either a new state value or a function that receives the previous state
   *                   and returns the new state
   */
  const setLayoutState = useCallback(
    (newValue: T | ((prevValue: T) => T)) => {
      // Update the state using either the new value or the result of the updater function
      setState((prevValue) =>
        typeof newValue === "function"
          ? (newValue as (prevValue: T) => T)(prevValue)
          : newValue
      );
      // Trigger a layout recalculation in the RecyclerView
      recyclerViewContext?.layout();
    },
    [recyclerViewContext]
  );

  return [state, setLayoutState];
}
