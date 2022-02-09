import React, { useRef } from "react";

import { RecyclerFlatListPerformanceViewNativeComponent } from "./RecyclerFlatListPerformanceViewNativeComponent";

/**
 * Wrap RecyclerFlatList with this view to get reports of blank spaces
 */
const RecyclerFlatListPerformanceView = ({ children }) => {
  const time = useRef(Date.now()).current;
  return (
    <RecyclerFlatListPerformanceViewNativeComponent
      onInteractive={({ nativeEvent }) => {
        console.log(`TTI in millis: ${nativeEvent.timestamp - time}`);
      }}
    >
      {children}
    </RecyclerFlatListPerformanceViewNativeComponent>
  );
};
export default RecyclerFlatListPerformanceView;
