import React, { useRef } from "react";
import {
  FlashList,
  useBenchmark,
  useFlatListBenchmark,
} from "@shopify/flash-list";

import Twitter from "./Twitter";
import Tweet from "./models/Tweet";

const TwitterBenchmark = () => {
  const ref = useRef<FlashList<Tweet>>(null);
  const [blankAreaTracker] = useFlatListBenchmark(
    ref,
    (res) => {
      if (!res.interrupted) {
        // eslint-disable-next-line no-alert
        alert(res.formattedString);
      }
    },
    { targetOffset: 200 * 100, speedMultiplier: 8, repeatCount: 10 }
  );
  return <Twitter instance={ref} blankAreaTracker={blankAreaTracker} />;
};
export default TwitterBenchmark;
