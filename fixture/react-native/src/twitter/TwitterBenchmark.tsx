import React, { useRef } from "react";
import { FlashListRef, useBenchmark } from "@shopify/flash-list";

import Twitter from "./Twitter";
import Tweet from "./models/Tweet";

const TwitterBenchmark = () => {
  const ref = useRef<FlashListRef<Tweet>>(null);
  useBenchmark(
    // @ts-ignore - Type compatibility issue with useFlatListBenchmark
    ref,
    (res) => {
      if (!res.interrupted) {
        // eslint-disable-next-line no-alert
        alert(res.formattedString);
      }
    },
    { speedMultiplier: 2, repeatCount: 5 }
  );

  // @ts-ignore - Type compatibility issue with ref passing
  return <Twitter instance={ref} />;
};
export default TwitterBenchmark;
