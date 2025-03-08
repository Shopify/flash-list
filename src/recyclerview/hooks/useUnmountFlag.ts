import { useRef, useLayoutEffect } from "react";

export const useUnmountFlag = () => {
  const isUnmounted = useRef(false);
  useLayoutEffect(() => {
    return () => {
      isUnmounted.current = true;
    };
  }, []);
  return isUnmounted;
};
