import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  StatusBar,
} from "react-native";
import { RecyclerView } from "@shopify/flash-list";

interface Item {
  id: number;
  title: string;
  color: string;
}

const generateItems = (count: number): Item[] => {
  const colors = [
    "#FF5252", // Red
    "#FF4081", // Pink
    "#E040FB", // Purple
    "#7C4DFF", // Deep Purple
    "#536DFE", // Indigo
    "#448AFF", // Blue
    "#40C4FF", // Light Blue
    "#18FFFF", // Cyan
    "#64FFDA", // Teal
    "#69F0AE", // Green
    "#B2FF59", // Light Green
    "#EEFF41", // Lime
    "#FFFF00", // Yellow
    "#FFD740", // Amber
    "#FFAB40", // Orange
    "#FF6E40", // Deep Orange
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    title: `Item ${i + 1}`,
    color: colors[i % colors.length],
  }));
};

const HorizontalList = () => {
  const [data] = useState<Item[]>(generateItems(20));

  const handleItemPress = (item: Item) => {
    Alert.alert("Item Pressed", `You selected ${item.title}`);
  };

  const renderItem = ({ item }: { item: Item }) => {
    return (
      <Pressable
        style={[styles.itemContainer, { backgroundColor: item.color }]}
        onPress={() => handleItemPress(item)}
      >
        <Text style={styles.itemText}>{item.title}</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.header}>Horizontal List Example</Text>
      <View style={styles.listContainer}>
        <RecyclerView
          horizontal
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>

      <Text style={styles.description}>
        This example demonstrates a horizontal scrolling list using
        RecyclerView. Each item has a unique color and can be tapped to show an
        alert.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    margin: 16,
    color: "#333",
  },
  listContainer: {
    height: 200,
    marginBottom: 16,
  },
  itemContainer: {
    width: 150,
    height: 180,
    margin: 8,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#666",
    margin: 16,
  },
});

export default HorizontalList;
