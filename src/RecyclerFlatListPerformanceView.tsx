import React, { useState } from "react";
import { RecyclerFlatListPerformanceViewNativeComponent } from "./RecyclerFlatListPerformanceViewNativeComponent";

const RecyclerFlatListPerformanceView = ({ children }) => {
  const [time] = useState(Date.now());
  return (
    <RecyclerFlatListPerformanceViewNativeComponent
      onInteractive={() => {
        console.log(`TTI in millis: ${Date.now() - time}`);
      }}
    >
      {children}
    </RecyclerFlatListPerformanceViewNativeComponent>
  );
};
export default RecyclerFlatListPerformanceView;
