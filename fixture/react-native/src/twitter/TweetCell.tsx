import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { useRecyclingState } from "@shopify/flash-list";
import { Pressable } from "react-native";

import { RootStackParamList } from "../constants";

import Tweet from "./models/Tweet";
import TweetContent from "./TweetContent";

export interface TweetCellProps {
  tweet: Tweet;
}

const TweetCell = ({ tweet }: TweetCellProps) => {
  const { navigate } =
    useNavigation<StackNavigationProp<RootStackParamList, "Twitter">>();
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
