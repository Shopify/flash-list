import { useCallback, useEffect, useState } from "react";

/**
 * Hook that provides a setTimeout which is aware of component unmount state.
 * Any timeouts created with this hook will be automatically cleared when the component unmounts.
 */
export function useUnmountAwareTimeout() {
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

/**
 * Hook that provides a requestAnimationFrame which is aware of component unmount state.
 * Any animation frames requested with this hook will be automatically canceled when the component unmounts.
 */
export function useUnmountAwareAnimationFrame() {
  // Store active animation frame request IDs in a Set for more efficient add/remove operations
  const [requestIds] = useState<Set<number>>(() => new Set());

  // Cancel all animation frame requests on unmount
  useEffect(() => {
    return () => {
      requestIds.forEach((id) => cancelAnimationFrame(id));
      requestIds.clear();
    };
  }, [requestIds]);

  // Create a safe requestAnimationFrame that will be canceled on unmount
  const requestAnimationFrame = useCallback(
    (callback: FrameRequestCallback): void => {
      const id = global.requestAnimationFrame((timestamp) => {
        // Remove this request ID from the tracking set
        requestIds.delete(id);
        callback(timestamp);
      });

      // Track this request ID
      requestIds.add(id);
    },
    [requestIds]
  );

  return {
    requestAnimationFrame,
  };
}
