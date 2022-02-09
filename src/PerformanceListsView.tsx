import React, { useCallback } from "react";
import { Flipper, addPlugin } from "react-native-flipper";

import { PerformanceListsViewContextProvider } from "./PerformanceListsViewContext";

interface PerformanceListsViewProps {
  onInteractive: (TTI: number, listName: string) => void;
  onBlankAreaEvent: (offsetStart: number, offsetEnd: number) => void;
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
  onBlankAreaEvent,
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
  const onBlankAreaEventCallback = useCallback(
    (offsetStart: number, offsetEnd: number, listName: string) => {
      onBlankAreaEvent(offsetStart, offsetEnd);
      const blankArea = Math.max(Math.max(offsetStart, offsetEnd), 0);
      connection?.send("newBlankData", {
        offset: blankArea,
        listName,
      });
    },
    [connection, onBlankAreaEvent]
  );
  return (
    <PerformanceListsViewContextProvider
      value={{
        onInteractive: onInteractiveCallback,
        onBlankAreaEvent: onBlankAreaEventCallback,
      }}
    >
      {children}
    </PerformanceListsViewContextProvider>
  );
};

export default PerformanceListsView;
