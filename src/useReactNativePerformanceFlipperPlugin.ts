import { Flipper, addPlugin } from "react-native-flipper";
import { useEffect } from "react";
import { BLANK_AREA_EVENT_NAME } from "./useOnNativeBlankAreaEvents";
import { NativeEventEmitter, NativeModules, Platform } from "react-native";

const bootstrapPlugin = (): Promise<Flipper.FlipperConnection> => {
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
};

const useReactNativePerformanceFlipperPlugin = () => {
  useEffect(() => {
    bootstrapPlugin().then((connection) => {
      const eventEmitter = new NativeEventEmitter(
        Platform.OS === "ios" ? NativeModules.BlankAreaEventEmitter : undefined
      );
      const onBlankAreaEvent = ({
        blankArea,
        listSize,
      }: {
        blankArea: number;
        listSize: number;
      }) => {
        connection.send("newBlankData", {
          // We do not report negative numbers to be consistent with FlatList measurements where there is no such thing as `renderAheadOffset`
          // that we currently use in `RecyclerFlatList` to determine last element to consider.
          offset: Math.max(0, Math.min(blankArea, listSize)),
        });
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
