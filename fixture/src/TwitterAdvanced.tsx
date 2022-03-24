import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";

import TweetCell from "./TweetCell";
import { tweets } from "./data/tweets2";
import Tweet from "./models/Tweet";

enum CellType {
  Text = 1,
  Image,
  Liked,
}

const AdvancedTwitter = () => {
  return (
    <FlashList
      keyExtractor={(item) => {
        return item.id;
      }}
      renderItem={({ item }) => {
        return <TweetCell tweet={item} />;
      }}
      ListHeaderComponent={Header}
      ListHeaderComponentStyle={{ backgroundColor: "#ccc" }}
      ListFooterComponent={Footer}
      estimatedItemSize={150}
      ItemSeparatorComponent={Divider}
      overrideItemType={ItemType}
      data={tweets}
    />
  );
};

const ItemType = (item: Tweet) => {
  let cellType = CellType.Text;
  if (item.image !== undefined && item.image !== null) {
    cellType += CellType.Image;
  }
  if (item.someLiked !== undefined && item.someLiked !== null) {
    cellType += CellType.Liked;
  }
  return cellType;
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

export default AdvancedTwitter;
