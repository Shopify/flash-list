import React, { useMemo, useState } from "react";
import { Text, View, StyleSheet, Platform, Pressable } from "react-native";
import { RecyclerView, useRecyclingState } from "@shopify/flash-list";

interface GridItem {
  id: number;
  title: string;
  color: string;
  span?: number;
}

export function Grid() {
  const [numItems] = useState(1000); // Default to 100 items

  // Generate colors for the grid items
  const colors = [
    "#FF5252",
    "#FF4081",
    "#E040FB",
    "#7C4DFF",
    "#536DFE",
    "#448AFF",
    "#40C4FF",
    "#18FFFF",
    "#64FFDA",
    "#69F0AE",
    "#B2FF59",
    "#EEFF41",
    "#FFFF00",
    "#FFD740",
    "#FFAB40",
    "#FF6E40",
  ];

  // Generate data using a loop
  const generateData = (count: number): GridItem[] => {
    const items: GridItem[] = [];
    for (let i = 0; i < count; i++) {
      items.push({
        id: i,
        title: `Item ${i}`,
        span: i % 9 === 0 ? 2 : 1,
        color: colors[i % colors.length], // Cycle through colors
      });
    }
    return items;
  };

  const data = useMemo(() => generateData(numItems), [numItems]);

  return (
    <View style={styles.container}>
      <RecyclerView
        data={data}
        numColumns={2}
        contentContainerStyle={{
          padding: 4,
        }}
        //initialScrollIndex={5}
        overrideItemLayout={(layout, item) => {
          layout.span = item.span;
        }}
        renderItem={({ item }) => {
          return <GridItem item={item} />;
        }}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}

const GridItem = ({ item }: { item: GridItem }) => {
  const [isExpanded, setIsExpanded] = useRecyclingState(
    false,
    [item.id],
    () => {
      console.log("recycle", item.id);
    }
  );
  const baseHeight = 50;
  const height = isExpanded ? (item.id % 2 == 0 ? 80 : 100) : baseHeight;
  return (
    <Pressable onPress={() => setIsExpanded(!isExpanded)}>
      <View
        style={[
          styles.itemWrapper,
          {
            backgroundColor: item.color,
          },
        ]}
      >
        <View
          style={[
            styles.item,
            {
              height,
            },
          ]}
        >
          <Text style={styles.itemText}>{item.title}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: Platform.OS === "web" ? undefined : 1,
    height: Platform.OS === "web" ? window.innerHeight : undefined,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  itemWrapper: {
    padding: 16,
    margin: 4,
    borderRadius: 8,
    flex: 1,
    justifyContent: "center",
  },
  item: {
    justifyContent: "center",
    alignItems: "center",
  },
  itemText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  spanText: {
    color: "#fff",
    marginTop: 8,
    fontSize: 12,
    opacity: 0.8,
  },
});
