import React from "react";
import { useRecyclingState } from "@shopify/flash-list";
import { Pressable } from "react-native";

import Tweet from "./models/Tweet";
import TweetContent from "./TweetContent";

export interface TweetCellProps {
  tweet: Tweet;
}

const TweetCell = ({ tweet }: TweetCellProps) => {
  // We don't need navigation in this component
  const [showFullText, setShowFullText] = useRecyclingState(false, [tweet]);
  return (
    <Pressable
      onPress={() => {
        // navigate("TweetDetailScreen", { tweet });
        setShowFullText(!showFullText);
      }}
    >
      <TweetContent tweet={tweet} showFullText={showFullText} />
    </Pressable>
  );
};

export default React.memo(TweetCell);
