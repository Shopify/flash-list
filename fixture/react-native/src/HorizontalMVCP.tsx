import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { FlashList } from "@shopify/flash-list";

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

let nextId = 0;

function generateItem(): { id: string; color: string; label: string } {
  const id = nextId++;
  return {
    id: `item-${id}`,
    color: COLORS[id % COLORS.length],
    label: `${id}`,
  };
}

function generateItems(count: number) {
  return Array.from({ length: count }, () => generateItem());
}

export function HorizontalMVCP() {
  const [items, setItems] = useState(() => generateItems(20));

  const prependItems = useCallback(() => {
    setItems((prev) => [...generateItems(5), ...prev]);
  }, []);

  const appendItems = useCallback(() => {
    setItems((prev) => [...prev, ...generateItems(5)]);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: { id: string; color: string; label: string } }) => (
      <View style={[styles.card, { backgroundColor: item.color }]}>
        <Text style={styles.cardText}>{item.label}</Text>
      </View>
    ),
    []
  );

  const keyExtractor = useCallback(
    (item: { id: string; color: string; label: string }) => item.id,
    []
  );

  const maintainVisibleContentPosition = useMemo(() => ({}), []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.description}>
          <Text style={styles.descriptionText}>
            Horizontal list with maintainVisibleContentPosition. Tap
            {" &quot;Prepend&quot; "}
            to add items at the start — scroll position should be maintained.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.button, styles.prependButton]}
            onPress={prependItems}
          >
            <Text style={styles.buttonText}>Prepend 5</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.appendButton]}
            onPress={appendItems}
          >
            <Text style={styles.buttonText}>Append 5</Text>
          </Pressable>
        </View>

        <View style={styles.listContainer}>
          <FlashList
            horizontal
            data={items}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            maintainVisibleContentPosition={maintainVisibleContentPosition}
          />
        </View>

        <View style={styles.countContainer}>
          <Text style={styles.countText}>Total items: {items.length}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
  },
  description: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  descriptionText: {
    fontSize: 14,
    color: "#666",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 8,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 4,
  },
  prependButton: {
    backgroundColor: "#4a90e2",
  },
  appendButton: {
    backgroundColor: "#50c878",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
    marginTop: 16,
  },
  card: {
    width: 120,
    height: 160,
    marginHorizontal: 6,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  countContainer: {
    padding: 12,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    alignItems: "center",
  },
  countText: {
    fontSize: 14,
    color: "#666",
  },
});
