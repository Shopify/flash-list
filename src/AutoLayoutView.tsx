import React, { useCallback, useEffect } from "react";

import AutoLayoutViewNativeComponent, {
  OnBlankAreaEvent,
} from "./AutoLayoutViewNativeComponent";

type BlankAreaEventHandler = (blankAreaEvent: BlankAreaEvent) => void;
const listeners: BlankAreaEventHandler[] = [];

export const useOnNativeBlankAreaEvents = (
  onBlankAreaEvent: (blankAreaEvent: BlankAreaEvent) => void
) => {
  useEffect(() => {
    listeners.push(onBlankAreaEvent);
    return () => {
      listeners.filter((callback) => callback !== onBlankAreaEvent);
    };
  }, [onBlankAreaEvent]);
};

interface BlankAreaEvent {
  offsetStart: number;
  offsetEnd: number;
  blankArea: number;
}

const AutoLayoutView = (props) => {
  const onBlankAreaEventCallback = useCallback(
    ({ nativeEvent }: OnBlankAreaEvent) => {
      const blankArea = Math.max(
        nativeEvent.offsetStart,
        nativeEvent.offsetEnd
      );
      listeners.forEach((listener) => {
        listener({
          blankArea,
          offsetStart: nativeEvent.offsetStart,
          offsetEnd: nativeEvent.offsetEnd,
        });
      });
    },
    []
  );
  return (
    <AutoLayoutViewNativeComponent
      onBlankAreaEvent={onBlankAreaEventCallback}
      enableInstrumentation={listeners.length !== 0}
      {...props}
    >
      {props.children}
    </AutoLayoutViewNativeComponent>
  );
};

export default AutoLayoutView;
