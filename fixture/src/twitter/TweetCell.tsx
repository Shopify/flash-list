import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
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
  return (
    <Pressable
      onPress={() => {
        navigate("TweetDetailScreen", { tweet });
      }}
    >
      <TweetContent tweet={tweet} />
    </Pressable>
  );
};

export default TweetCell;
