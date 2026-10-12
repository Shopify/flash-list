import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewabilityConfig,
} from "react-native";
import { FlashList, FlashListRef } from "@shopify/flash-list";

import { DebugContext } from "../Debug/DebugContext";

import TweetCell from "./TweetCell";
import { tweets as tweetsData } from "./data/tweets";
import Tweet from "./models/Tweet";

export interface TwitterProps {
  instance?: React.RefObject<FlashListRef<Tweet>>;
  CellRendererComponent?: React.ComponentType<any>;
  disableAutoLayout?: boolean;
}

const Twitter = ({
  instance,
  CellRendererComponent,
  disableAutoLayout,
}: TwitterProps) => {
  const debugContext = useContext(DebugContext);
  const [refreshing, setRefreshing] = useState(false);
  const nextTweetIndex = useRef(
    debugContext.pagingEnabled ? 10 : tweetsData.length
  );
  const refreshTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tweets, setTweets] = useState(() =>
    debugContext.pagingEnabled ? tweetsData.slice(0, 10) : tweetsData
  );
  useEffect(
    () => () => {
      if (refreshTimeout.current !== null) clearTimeout(refreshTimeout.current);
      if (pageTimeout.current !== null) clearTimeout(pageTimeout.current);
      refreshTimeout.current = null;
      pageTimeout.current = null;
    },
    []
  );
  const viewabilityConfig = useRef<ViewabilityConfig>({
    waitForInteraction: false,
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 1000,
  }).current;

  return (
    // @ts-ignore - Type compatibility issue between different React versions
    <FlashList
      ref={instance}
      testID="FlashList"
      keyExtractor={(item) => {
        return item.id;
      }}
      renderItem={({ item }) => {
        return <TweetCell tweet={item} />;
      }}
      refreshing={refreshing}
      onRefresh={() => {
        if (refreshTimeout.current !== null) return;
        setRefreshing(true);
        refreshTimeout.current = setTimeout(() => {
          refreshTimeout.current = null;
          setRefreshing(false);
          setTweets((previous) => [...previous].reverse());
        }, 500);
      }}
      // @ts-ignore - Type compatibility issue between different React versions
      CellRendererComponent={CellRendererComponent}
      onEndReached={() => {
        if (
          !debugContext.pagingEnabled ||
          pageTimeout.current !== null ||
          nextTweetIndex.current >= tweetsData.length
        ) {
          return;
        }
        pageTimeout.current = setTimeout(() => {
          pageTimeout.current = null;
          const page = tweetsData.slice(
            nextTweetIndex.current,
            nextTweetIndex.current + 10
          );
          nextTweetIndex.current += page.length;
          setTweets((previous) => [...previous, ...page]);
        }, 1000);
      }}
      ListHeaderComponent={Header}
      ListHeaderComponentStyle={{ backgroundColor: "#ccc" }}
      ListFooterComponent={
        <Footer
          isLoading={tweets.length !== tweetsData.length}
          isPagingEnabled={debugContext.pagingEnabled}
        />
      }
      ListEmptyComponent={Empty()}
      estimatedItemSize={150}
      ItemSeparatorComponent={Divider}
      data={debugContext.emptyListEnabled ? [] : tweets}
      initialScrollIndex={debugContext.initialScrollIndex}
      viewabilityConfig={viewabilityConfig}
      onViewableItemsChanged={(info) => {
        console.log(info);
      }}
      disableAutoLayout={disableAutoLayout}
    />
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

export const Empty = () => {
  const title = "Welcome to your timeline";
  const subTitle =
    "It's empty now but it won't be for long. Start following peopled you'll see Tweets show up here";
  return (
    <View style={styles.emptyComponent} testID="EmptyComponent">
      <Text style={styles.emptyComponentTitle}>{title}</Text>
      <Text style={styles.emptyComponentSubtitle}>{subTitle}</Text>
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
  emptyComponentTitle: {
    color: "black",
    fontSize: 20,
    fontWeight: "bold",
  },
  emptyComponentSubtitle: {
    color: "#808080",
    padding: 8,
    fontSize: 14,
    textAlign: "center",
  },
  emptyComponent: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
});

export default Twitter;
