import React from "react";
import { FlatList } from "react-native";
import { FlatListPerformanceView } from "@shopify/react-native-performance-lists-profiler";

import { tweets } from "./data/tweets";
import TweetCell from "./TweetCell";
import { Header, Footer, Divider } from "./Twitter";

const TwitterFlatList = () => {
  return (
    <FlatListPerformanceView listName="TwitterFlatList">
      <FlatList
        testID="FlatList"
        keyExtractor={(item) => {
          return item.id;
        }}
        renderItem={({ item }) => {
          return <TweetCell tweet={item} />;
        }}
        ListHeaderComponent={Header}
        ListHeaderComponentStyle={{ backgroundColor: "#ccc" }}
        ListFooterComponent={Footer}
        ItemSeparatorComponent={Divider}
        data={tweets}
      />
    </FlatListPerformanceView>
  );
};

export default TwitterFlatList;
