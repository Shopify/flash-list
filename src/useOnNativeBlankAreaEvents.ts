import { useCallback, useEffect } from "react";
import { NativeEventEmitter, NativeModules, Platform } from "react-native";

export interface BlankAreaEvent {
  offset: Number;
}

export const BLANK_AREA_EVENT_NAME = "instrumentation";

const useOnNativeBlankAreaEvents = (callback: (offset: Number) => {}) => {
  const onBlankAreaEvent = useCallback(
    ({ offset }: BlankAreaEvent) => {
      callback(offset);
    },
    [callback]
  );

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(
      Platform.OS === "ios" ? NativeModules.BlankAreaEventEmitter : undefined
    );
    const subscription = eventEmitter.addListener(
      BLANK_AREA_EVENT_NAME,
      onBlankAreaEvent
    );
    return () => subscription.remove();
  }, [onBlankAreaEvent]);
};

export default useOnNativeBlankAreaEvents;
