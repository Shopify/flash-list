import React, { useContext, useRef, useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { FlashListPerformanceView } from "@shopify/react-native-performance-lists-profiler";

import { DebugContext } from "../Debug";

import TweetCell from "./TweetCell";
import { tweets as tweetsData } from "./data/tweets";
import Tweet from "./models/Tweet";

const Twitter = () => {
  const debugContext = useContext(DebugContext);
  const scrollToIndexContext = debugContext.scrollToIndex;
  const [refreshing, setRefreshing] = useState(false);
  const remainingTweets = useRef([...tweetsData].splice(10, tweetsData.length));
  const [tweets, setTweets] = useState(
    debugContext.pagingEnabled ? [...tweetsData].splice(0, 10) : tweetsData
  );

  const flashListRef = useRef<FlashList<Tweet> | null>(null);

  useEffect(() => {
    if (scrollToIndexContext.delay && scrollToIndexContext.index) {
      const scrollToIndex = scrollToIndexContext.index;
      setTimeout(() => {
        flashListRef.current?.scrollToIndex({ index: scrollToIndex });
      }, scrollToIndexContext.delay);
    }
  });

  return (
    <FlashListPerformanceView listName="Twitter">
      <FlashList
        testID="FlashList"
        ref={flashListRef}
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
        onEndReached={() => {
          if (!debugContext.pagingEnabled) {
            return;
          }
          setTimeout(() => {
            setTweets([...tweets, ...remainingTweets.current.splice(0, 10)]);
          }, 1000);
        }}
        ListHeaderComponent={Header}
        ListHeaderComponentStyle={{ backgroundColor: "#ccc" }}
        ListFooterComponent={() => {
          return (
            <Footer
              isLoading={tweets.length !== tweetsData.length}
              isPagingEnabled={debugContext.pagingEnabled}
            />
          );
        }}
        estimatedItemSize={150}
        ItemSeparatorComponent={Divider}
        data={tweets}
        initialScrollIndex={debugContext.initialScrollIndex}
        estimatedFirstItemOffset={styles.header.height}
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

interface FooterProps {
  isLoading: boolean;
  isPagingEnabled: boolean;
}

export const Footer = ({ isLoading, isPagingEnabled }: FooterProps) => {
  return (
    <View style={styles.footer}>
      {isLoading && isPagingEnabled ? (
        <ActivityIndicator />
      ) : (
        <Text style={styles.footerTitle}>No more tweets</Text>
      )}
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
