import { View, Text, Pressable, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import React from "react";

interface Item {
  id: number;
  title: string;
}

const DATA = [...Array(30).keys()].map((i) => {
  return { id: i, title: `Item ${i}` };
});

function Item({ item }: { item: Item }) {
  return (
    <Pressable>
      {({ pressed }) => (
        <View style={styles.item}>
          <Text>{item.title}</Text>
          {pressed ? <Text>pressed</Text> : null}
        </View>
      )}
    </Pressable>
  );
}

const renderItem = ({ item }: { item: Item }) => {
  return <Item item={item} />;
};

export default function LotOfItemsHorizontalList() {
  return <FlashList data={DATA} horizontal renderItem={renderItem} />;
}

const styles = StyleSheet.create({
  item: {
    width: 50,
  },
});
