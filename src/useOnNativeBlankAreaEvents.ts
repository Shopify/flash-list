import { useCallback, useEffect } from "react";
import { NativeEventEmitter, NativeModules, Platform } from "react-native";

export interface BlankAreaEvent {
  offsetStart: number;
  offsetEnd: number;
  blankArea: number;
}

export const BLANK_AREA_EVENT_NAME = "blankAreaEvent";

const useOnNativeBlankAreaEvents = (
  callback: (offsetStart: number, offsetEnd: number, blankArea: number) => void
) => {
  const onBlankAreaEvent = useCallback(
    ({ offsetStart, offsetEnd, blankArea }: BlankAreaEvent) => {
      callback(offsetStart, offsetEnd, blankArea);
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
