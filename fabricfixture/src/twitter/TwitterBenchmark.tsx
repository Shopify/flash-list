import React, { useRef } from "react";
import { Alert } from "react-native";
import { FlashList, useBenchmark } from "@shopify/flash-list";

import Twitter from "./Twitter";
import Tweet from "./models/Tweet";

const TwitterBenchmark = () => {
  const ref = useRef<FlashList<Tweet>>(null);
  const [blankAreaTracker] = useBenchmark(ref, (res) => {
    if (!res.interrupted) {
      Alert.alert("Benchmark", res.formattedString);
    }
  });
  return <Twitter instance={ref} blankAreaTracker={blankAreaTracker} />;
};
export default TwitterBenchmark;
