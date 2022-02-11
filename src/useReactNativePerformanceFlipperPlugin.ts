import { Flipper, addPlugin } from "react-native-flipper";
import { useEffect } from "react";
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
    bootstrapPlugin()
      .then((connection) => {
        const eventEmitter = new NativeEventEmitter(
          Platform.OS === "ios"
            ? NativeModules.BlankAreaEventEmitter
            : undefined
        );
        const onBlankAreaEvent = ({
          offsetStart,
          offsetEnd,
          listSize,
        }: {
          offsetStart: number;
          offsetEnd: number;
          listSize: number;
        }) => {
          const blankArea = Math.max(offsetStart, offsetEnd);
          connection.send("newBlankData", {
            // We do not report negative numbers to be consistent with FlatList measurements where there is no such thing as `renderAheadOffset`
            // that we currently use in `RecyclerFlatList` to determine last element to consider.
            offset: Math.max(0, Math.min(blankArea, listSize)),
          });
        };
        const subscription = eventEmitter.addListener(
          "blankAreaEvent",
          onBlankAreaEvent
        );
        return () => subscription.remove();
      })
      .catch((error) => {
        throw error;
      });
  }, []);
};

export default useReactNativePerformanceFlipperPlugin;
