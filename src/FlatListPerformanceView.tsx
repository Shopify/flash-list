import React, { useState } from "react";
import { FlatListPerformanceViewNativeComponent } from "./FlatListPerformanceViewNativeComponent";

const FlatListPerformanceView = ({ children }) => {
  const [time] = useState(Date.now());
  return (
    <FlatListPerformanceViewNativeComponent
      onInteractive={() => {
        console.log(`TTI in millis: ${Date.now() - time}`);
      }}
    >
      {children}
    </FlatListPerformanceViewNativeComponent>
  );
};
export default FlatListPerformanceView;
