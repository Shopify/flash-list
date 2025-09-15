import { View, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import React from "react";

import LotOfItemsHorizontalList from "./LotOfItemsHorizontalList";

interface Item {
  id: number;
  title: string;
}

const DATA = [...Array(100).keys()].map((i) => {
  return { id: i, title: `Bloc ${i}` };
});

function ItemList({ item }: { item: Item }) {
  return (
    <View>
      <LotOfItemsHorizontalList />
    </View>
  );
}

const renderItem = ({ item }: { item: Item }) => {
  return <ItemList item={item} />;
};

export default function Reminders() {
  return (
    <FlashList data={DATA} renderItem={renderItem} style={styles.container} />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ecf0f1",
  },
});
