import { useCallback, useEffect, useState } from "react";

/**
 * Hook that provides callbacks which are aware of component unmount state.
 * Any timeouts created with these callbacks will be automatically cleared when the component unmounts.
 */
export function useUnmountAwareCallbacks() {
  // Store active timeout IDs in a Set for more efficient add/remove operations
  const [timeoutIds] = useState<Set<NodeJS.Timeout>>(() => new Set());

  // Clear all timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutIds.forEach((id) => global.clearTimeout(id));
      timeoutIds.clear();
    };
  }, [timeoutIds]);

  // Create a safe setTimeout that will be cleared on unmount
  const setTimeout = useCallback(
    (callback: () => void, delay: number): void => {
      const id = global.setTimeout(() => {
        // Remove this timeout ID from the tracking set
        timeoutIds.delete(id);
        callback();
      }, delay);

      // Track this timeout ID
      timeoutIds.add(id);
    },
    [timeoutIds]
  );

  return {
    setTimeout,
  };
}
