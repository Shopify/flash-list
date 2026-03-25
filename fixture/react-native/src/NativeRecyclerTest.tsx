import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { NativeRecyclerView } from "@shopify/flash-list/dist/recyclerview/NativeRecyclerView";

const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
];

interface Item {
  id: string;
  title: string;
  height: number;
  color: string;
}

const generateData = (count: number): Item[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    title: `Item ${i}`,
    height: 60 + (i % 5) * 20,
    color: COLORS[i % COLORS.length],
  }));
};

const NativeRecyclerTest = () => {
  const [data] = useState(() => generateData(100));

  const renderItem = useCallback(
    ({ item, index }: { item: Item; index: number }) => {
      return (
        <View style={[styles.item, { height: item.height, backgroundColor: item.color }]}>
          <Text style={styles.itemText}>{item.title}</Text>
          <Text style={styles.indexText}>Index: {index}</Text>
        </View>
      );
    },
    []
  );

  const keyExtractor = useCallback((item: Item) => item.id, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Native RecyclerView Test</Text>
      <NativeRecyclerView
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    padding: 16,
    backgroundColor: "#f0f0f0",
  },
  item: {
    padding: 16,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  itemText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  indexText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
});

export default NativeRecyclerTest;
