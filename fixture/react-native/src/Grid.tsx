import React, { useMemo, useState, useCallback } from "react";
import { Text, View, StyleSheet, Platform, Pressable } from "react-native";
import { FlashList, useRecyclingState } from "@shopify/flash-list";

interface GridItem {
  id: number;
  title: string;
  color: string;
  span?: number;
}
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

export function Grid() {
  const [numItems] = useState(1000); // Default to 100 items

  // Generate colors for the grid items

  const data = useMemo(() => generateData(numItems), [numItems]);

  const contentContainerStyle = useMemo(
    () => ({
      padding: 4,
    }),
    []
  );

  const overrideItemLayout = useCallback(
    (layout: { span: number }, item: GridItem) => {
      layout.span = item.span ?? 1;
    },
    []
  );

  const renderItem = useCallback(({ item }: { item: GridItem }) => {
    return <GridItem item={item} />;
  }, []);

  const keyExtractor = useCallback((item: GridItem) => item.id.toString(), []);

  return (
    <React.StrictMode>
      <View style={styles.container}>
        <FlashList
          testID="GridScreen"
          data={data}
          numColumns={2}
          contentContainerStyle={contentContainerStyle}
          // maintainVisibleContentPosition={{}}
          initialScrollIndex={25}
          overrideItemLayout={overrideItemLayout}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
        />
      </View>
    </React.StrictMode>
  );
}

const GridItem = ({ item }: { item: GridItem }) => {
  const [isExpanded, setIsExpanded] = useRecyclingState(false, [item.id]);
  const baseHeight = 50;
  const height = isExpanded ? (item.id % 2 === 0 ? 80 : 100) : baseHeight;
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
});
