import { RouteProp, useRoute } from "@react-navigation/native";
import React from "react";
import { StyleSheet, View } from "react-native";

import { RootStackParamList } from "../constants";

import TweetContent from "./TweetContent";

const TweetDetailScreen = () => {
  const {
    params: { tweet },
  } = useRoute<RouteProp<RootStackParamList, "TweetDetailScreen">>();
  return (
    <View testID="TweetDetailScreen" style={styles.container}>
      <TweetContent tweet={tweet} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});

export default TweetDetailScreen;
