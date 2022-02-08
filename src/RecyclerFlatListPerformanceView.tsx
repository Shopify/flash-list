import React, { useState } from "react";
import { RecyclerFlatListPerformanceViewNativeComponent } from "./RecyclerFlatListPerformanceViewNativeComponent";

const RecyclerFlatListPerformanceView = ({ children }) => {
  const [time] = useState(Date.now());
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
