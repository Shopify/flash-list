import React, { useContext, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { FlashListPerformanceView } from "@shopify/react-native-performance-lists-profiler";

import { DebugContext } from "../Debug";

import TweetCell from "./TweetCell";
import { tweets as tweetsData } from "./data/tweets";

const Twitter = () => {
  const debugContext = useContext(DebugContext);
  const [refreshing, setRefreshing] = useState(false);
  const [tweets, setTweets] = useState(tweetsData);

  return (
    <FlashListPerformanceView listName="Twitter">
      <FlashList
        testID="FlashList"
        keyExtractor={(item) => {
          return item.id;
        }}
        renderItem={({ item }) => {
          return <TweetCell tweet={item} />;
        }}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          setTimeout(() => {
            setRefreshing(false);
            setTweets([...tweets.reverse()]);
          }, 500);
        }}
        ListHeaderComponent={Header}
        ListHeaderComponentStyle={{ backgroundColor: "#ccc" }}
        ListFooterComponent={Footer}
        estimatedItemSize={150}
        ItemSeparatorComponent={Divider}
        data={tweets}
        initialScrollIndex={debugContext.initialScrollIndex}
      />
    </FlashListPerformanceView>
  );
};

export const Divider = () => {
  return <View style={styles.divider} />;
};

export const Header = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>New tweets available</Text>
    </View>
  );
};

export const Footer = () => {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerTitle}>No more tweets</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  divider: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#DDD",
  },
  header: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1DA1F2",
  },
  footer: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    padding: 8,
    borderRadius: 12,
    fontSize: 12,
  },
  footerTitle: {
    padding: 8,
    borderRadius: 12,
    fontSize: 12,
  },
});

export default Twitter;
