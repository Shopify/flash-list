import { Flipper, addPlugin } from "react-native-flipper";
import { useEffect } from "react";
import { BLANK_AREA_EVENT_NAME } from "./useOnNativeBlankAreaEvents";
import { NativeEventEmitter, NativeModules, Platform } from "react-native";

function bootstrapPlugin(): Promise<Flipper.FlipperConnection> {
  return new Promise((resolve) => {
    addPlugin({
      getId: () => "flipper-plugin-react-native-performance",
      onConnect: (connection) => {
        return resolve(connection);
      },
      onDisconnect: () => {},
      runInBackground: () => true,
    });
  });
}

const useReactNativePerformanceFlipperPlugin = () => {
  useEffect(() => {
    bootstrapPlugin().then((connection) => {
      const eventEmitter = new NativeEventEmitter(
        Platform.OS === "ios" ? NativeModules.BlankAreaEventEmitter : undefined
      );
      const onBlankAreaEvent = ({ offset }: { offset: number }) => {
        connection.send("newBlankData", { offset });
      };
      const subscription = eventEmitter.addListener(
        BLANK_AREA_EVENT_NAME,
        onBlankAreaEvent
      );
      return () => subscription.remove();
    });
  }, []);
};

export default useReactNativePerformanceFlipperPlugin;
