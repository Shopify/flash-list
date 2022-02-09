import React, { useRef } from "react";

import { FlatListPerformanceViewNativeComponent } from "./FlatListPerformanceViewNativeComponent";

/**
 * Wrap FlatList with this view to get reports of blank spaces
 */
const FlatListPerformanceView = ({ children }) => {
  const time = useRef(Date.now()).current;
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
