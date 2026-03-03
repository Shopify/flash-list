import React, { useCallback, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";

/**
 * Repro for https://github.com/Shopify/flash-list/issues/1797
 * Items overlap when initialScrollIndex is set and items have highly variable heights.
 */

interface Item {
  id: number;
  height: number;
}

// Seeded random to get consistent heights
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const generateData = (count: number): Item[] => {
  const items: Item[] = [];
  for (let i = 0; i < count; i++) {
    // Heights vary wildly: 40px to 500px
    const rand = seededRandom(i + 1);
    const height = Math.floor(40 + rand * 460);
    items.push({ id: i, height });
  }
  return items;
};

const INITIAL_SCROLL_INDEX = 50;

export function OverlapRepro() {
  const data = useMemo(() => generateData(200), []);

  const renderItem = useCallback(({ item }: { item: Item }) => {
    return (
      <View style={[styles.item, { height: item.height }]}>
        <Text style={styles.text}>
          Item {item.id} (h={item.height})
        </Text>
      </View>
    );
  }, []);

  const keyExtractor = useCallback((item: Item) => item.id.toString(), []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        initialScrollIndex={INITIAL_SCROLL_INDEX}, 200 items, heights 40-500px
      </Text>
      <FlashList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        initialScrollIndex={INITIAL_SCROLL_INDEX}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 8,
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    backgroundColor: "#e0e0e0",
  },
  item: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 1,
    marginHorizontal: 8,
    backgroundColor: "#4a90d9",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#3a7bc0",
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
