import React, { useCallback, useEffect } from "react";
import { Flipper, addPlugin } from "react-native-flipper";
import { NativeEventEmitter, NativeModules, Platform } from "react-native";

import { PerformanceListsViewContextProvider } from "./PerformanceListsViewContext";

interface PerformanceListsViewProps {
  onInteractive: (TTI: number, listName: string) => void;
  children: JSX.Element;
}

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

const PerformanceListsView = ({
  onInteractive,
  children,
}: PerformanceListsViewProps) => {
  let connection: Flipper.FlipperConnection | undefined;
  bootstrapPlugin()
    .then((conn) => {
      connection = conn;
    })
    .catch((error) => {
      throw error;
    });
  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(
      Platform.OS === "ios" ? NativeModules.BlankAreaEventEmitter : undefined
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
      connection?.send("newBlankData", {
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
  }, [connection]);
  const onInteractiveCallback = useCallback(
    (TTI: number, listName: string) => {
      onInteractive(TTI, listName);
      connection?.send("newListTTIData", {
        TTI,
        listName,
      });
    },
    [connection, onInteractive]
  );
  return (
    <PerformanceListsViewContextProvider
      value={{ onInteractive: onInteractiveCallback }}
    >
      {children}
    </PerformanceListsViewContextProvider>
  );
};

export default PerformanceListsView;
