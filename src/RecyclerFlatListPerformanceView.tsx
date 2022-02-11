import React, { useContext, useRef } from "react";

import { PerformanceListsViewContext } from "./PerformanceListsViewContext";
import { RecyclerFlatListPerformanceViewNativeComponent } from "./RecyclerFlatListPerformanceViewNativeComponent";

interface RecyclerFlatListPerformanceViewProps {
  listName: string;
  children: JSX.Element;
}

const RecyclerFlatListPerformanceView = ({
  listName,
  children,
}: RecyclerFlatListPerformanceViewProps) => {
  const time = useRef(Date.now()).current;
  const performanceController = useContext(PerformanceListsViewContext);
  return (
    <RecyclerFlatListPerformanceViewNativeComponent
      onInteractive={({ nativeEvent }) => {
        performanceController.onInteractive(
          nativeEvent.timestamp - time,
          listName
        );
      }}
    >
      {children}
    </RecyclerFlatListPerformanceViewNativeComponent>
  );
};
export default RecyclerFlatListPerformanceView;
