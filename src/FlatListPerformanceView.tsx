import React, { useState } from "react";

import { FlatListPerformanceViewNativeComponent } from "./FlatListPerformanceViewNativeComponent";

const FlatListPerformanceView = ({ children }) => {
  const [time] = useState(Date.now());
  return (
    <FlatListPerformanceViewNativeComponent
      onInteractive={({ nativeEvent }) => {
        console.log(`TTI in millis: ${nativeEvent.timestamp - time}`);
      }}
    >
      {children}
    </FlatListPerformanceViewNativeComponent>
  );
};
export default FlatListPerformanceView;
