import React, { useRef } from "react";
import { FlashList, useBenchmark } from "@shopify/flash-list";

import Twitter from "./Twitter";
import Tweet from "./models/Tweet";

const TwitterBenchmark = () => {
  const ref = useRef<FlashList<Tweet>>(null);
  const [blankAreaTracker] = useBenchmark(ref, (res) => {
    if (!res.interrupted) {
      // eslint-disable-next-line no-alert
      alert(res.formattedString);
    }
  });
  return <Twitter instance={ref} blankAreaTracker={blankAreaTracker} />;
};
export default TwitterBenchmark;
