import React, { useContext } from "react";
import { FlatList } from "react-native";
import { FlatListPerformanceView } from "@shopify/react-native-performance-lists-profiler";

import { tweets } from "./data/tweets";
import TweetCell from "./TweetCell";
import { Header, Footer, Divider } from "./Twitter";
import { DebugContext } from "./Debug";

const TwitterFlatList = () => {
  const debugContext = useContext(DebugContext);
  const initialScrollIndex = debugContext.initialScrollIndexEnabled
    ? debugContext.initialScrollIndex
    : undefined;

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
        initialScrollIndex={initialScrollIndex}
      />
    </FlatListPerformanceView>
  );
};

export default TwitterFlatList;
