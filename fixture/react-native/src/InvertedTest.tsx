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

type Scenario = "items" | "empty" | "sticky";

const items = Array.from({ length: 20 }, (_, i) => `Item ${i}`);

const Header = () => (
  <View style={styles.header}>
    <Text style={styles.headerText}>Header</Text>
  </View>
);

const Footer = () => (
  <View style={styles.footer}>
    <Text style={styles.footerText}>Footer</Text>
  </View>
);

const Empty = () => (
  <View style={styles.empty}>
    <Text style={styles.emptyText}>No items to display</Text>
  </View>
);

const Separator = () => <View style={styles.separator} />;

export function InvertedTest() {
  const [scenario, setScenario] = useState<Scenario>("items");

  const data = scenario === "empty" ? [] : items;
  const stickyHeaderIndices = useMemo(
    () => (scenario === "sticky" ? [0, 5, 10, 15] : undefined),
    [scenario]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: string; index: number }) => {
      const isSticky = stickyHeaderIndices?.includes(index);
      return (
        <View style={[styles.item, isSticky && styles.stickyItem]}>
          <Text style={styles.itemText}>
            {isSticky ? `Sticky: ${item}` : item}
          </Text>
        </View>
      );
    },
    [stickyHeaderIndices]
  );

  return (
    <SafeAreaView style={styles.safeArea} testID="InvertedTestScreen">
      <StatusBar barStyle="dark-content" />
      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.button, scenario === "items" && styles.activeButton]}
          onPress={() => setScenario("items")}
          testID="ShowItems"
        >
          <Text style={styles.buttonText}>Items</Text>
        </Pressable>
        <Pressable
          style={[styles.button, scenario === "empty" && styles.activeButton]}
          onPress={() => setScenario("empty")}
          testID="ShowEmpty"
        >
          <Text style={styles.buttonText}>Empty</Text>
        </Pressable>
        <Pressable
          style={[styles.button, scenario === "sticky" && styles.activeButton]}
          onPress={() => setScenario("sticky")}
          testID="ShowSticky"
        >
          <Text style={styles.buttonText}>Sticky</Text>
        </Pressable>
      </View>
      <FlashList
        data={data}
        inverted
        renderItem={renderItem}
        keyExtractor={(item) => item}
        ListHeaderComponent={Header}
        ListFooterComponent={Footer}
        ListEmptyComponent={Empty}
        ItemSeparatorComponent={Separator}
        stickyHeaderIndices={stickyHeaderIndices}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  buttonContainer: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
    flex: 1,
    alignItems: "center",
  },
  activeButton: {
    backgroundColor: "#4a90e2",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  header: {
    padding: 16,
    backgroundColor: "#e8f4fd",
    alignItems: "center",
  },
  headerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  footer: {
    padding: 16,
    backgroundColor: "#fde8e8",
    alignItems: "center",
  },
  footerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  empty: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#999",
  },
  separator: {
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  item: {
    padding: 16,
    backgroundColor: "#ffffff",
  },
  stickyItem: {
    backgroundColor: "#fff3cd",
  },
  itemText: {
    fontSize: 16,
    color: "#333",
  },
});
