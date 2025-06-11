import { useRef, useLayoutEffect } from "react";

/**
 * Hook that provides a way to track component unmounting state.
 * This hook is particularly useful for preventing state updates or side effects
 * after a component has unmounted, helping to avoid memory leaks and race conditions.
 *
 * @returns A ref containing a boolean flag that indicates whether the component is unmounted
 *         (true) or mounted (false)
 */
export const useUnmountFlag = () => {
  // Create a ref to store the unmount state
  // Using ref ensures the value persists between renders without causing re-renders
  const isUnmounted = useRef(false);

  // Use layoutEffect to set up cleanup on unmount
  // This ensures the flag is set before any other cleanup effects run
  useLayoutEffect(() => {
    isUnmounted.current = false;
    // Cleanup function that runs when the component unmounts
    return () => {
      isUnmounted.current = true;
    };
  }, []);

  return isUnmounted;
};
