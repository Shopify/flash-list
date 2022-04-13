import React, { useRef } from "react";
import { useBenchmark } from "@shopify/flash-list";
import Twitter from "./Twitter";
const TwitterBenchmark = () => {
  const ref = useRef();
  const [blankAreaTracker] = useBenchmark(ref, (res) => {
    if (!res.interrupted) {
      alert(res.formattedString);
    }
  });
  return <Twitter instance={ref} blankAreaTracker={blankAreaTracker} />;
};
export default TwitterBenchmark;
