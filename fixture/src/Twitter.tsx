import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { RecyclerFlatList } from "@shopify/recycler-flat-list";

import { tweets } from "./data/tweets";
import TweetCell from "./TweetCell";

const Twitter = () => {
  return (
    <RecyclerFlatList
      keyExtractor={(item) => {
        return item.id;
      }}
      renderItem={({ item }) => {
        return <TweetCell item={item} />;
      }}
      ListHeaderComponent={Header}
      ListHeaderCompomentStyle={{ backgroundColor: "#ccc" }}
      ListFooterComponent={Footer}
      estimatedHeight={150}
      ItemSeparatorComponent={Divider}
      data={tweets}
    />
  );
};

const Divider = () => {
  return <View style={styles.divider} />;
};

const Header = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>New tweets available</Text>
    </View>
  );
};
const Footer = () => {
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
