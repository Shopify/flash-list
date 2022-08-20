import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewabilityConfig,
} from "react-native";
import { BlankAreaEventHandler, FlashList } from "@shopify/flash-list";

import TweetCell from "./TweetCell";
import { tweets as tweetsData } from "./data/tweets";
import Tweet from "./models/Tweet";

export interface TwitterProps {
  instance?: React.RefObject<FlashList<Tweet>>;
  blankAreaTracker?: BlankAreaEventHandler;
  CellRendererComponent?: React.ComponentType<any>;
  disableAutoLayout?: boolean;
}

const Twitter = ({
  instance,
  blankAreaTracker,
  CellRendererComponent,
  disableAutoLayout,
}: TwitterProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const [tweets, setTweets] = useState(tweetsData);
  const viewabilityConfig = useRef<ViewabilityConfig>({
    waitForInteraction: true,
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 1000,
  }).current;

  return (
    <FlashList
      ref={instance}
      onBlankArea={blankAreaTracker}
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
          const reversedTweets = [...tweets];
          reversedTweets.reverse();
          setTweets(reversedTweets);
        }, 500);
      }}
      CellRendererComponent={CellRendererComponent}
      ListHeaderComponent={Header}
      ListHeaderComponentStyle={{ backgroundColor: "#ccc" }}
      ListFooterComponent={
        <Footer
          isLoading={tweets.length !== tweetsData.length}
          isPagingEnabled={false}
        />
      }
      ListEmptyComponent={Empty()}
      estimatedItemSize={150}
      ItemSeparatorComponent={Divider}
      data={tweets}
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
