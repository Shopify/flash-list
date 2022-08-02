import React from "react";
import { Pressable } from "react-native";

import Tweet from "./models/Tweet";
import TweetContent from "./TweetContent";

export interface TweetCellProps {
  tweet: Tweet;
}

const TweetCell = ({ tweet }: TweetCellProps) => {
  return (
    <Pressable
      onPress={() => {
        console.log("press on", tweet.id);
      }}
    >
      <TweetContent tweet={tweet} />
    </Pressable>
  );
};

export default TweetCell;
