import React, { useRef, useContext } from "react";

import { PerformanceListsViewContext } from "./PerformanceListsViewContext";
import { FlatListPerformanceViewNativeComponent } from "./FlatListPerformanceViewNativeComponent";

interface RecyclerFlatListPerformanceViewProps {
  listName: string;
  children: JSX.Element;
}

const FlatListPerformanceView = ({
  children,
  listName,
}: RecyclerFlatListPerformanceViewProps) => {
  const time = useRef(Date.now()).current;
  const performanceController = useContext(PerformanceListsViewContext);
  return (
    <FlatListPerformanceViewNativeComponent
      onInteractive={({ nativeEvent }) => {
        performanceController.onInteractive(
          nativeEvent.timestamp - time,
          listName
        );
      }}
    >
      {children}
    </FlatListPerformanceViewNativeComponent>
  );
};
export default FlatListPerformanceView;
