import React, { useState, useCallback, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FlashList } from "@shopify/flash-list";

interface ListItem {
  id: string;
  title: string;
}

const SAMPLE_DATA: ListItem[] = Array.from({ length: 20 }, (_, index) => ({
  id: index.toString(),
  title: `Item ${index + 1}`,
}));

export const HeaderFooterExample = () => {
  const [showEmpty, setShowEmpty] = useState(false);
  const data = useMemo(() => (showEmpty ? [] : SAMPLE_DATA), [showEmpty]);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => (
      <View style={styles.itemContainer}>
        <Text style={styles.itemText}>{item.title}</Text>
      </View>
    ),
    []
  );

  const toggleEmpty = useCallback(() => setShowEmpty(!showEmpty), [showEmpty]);

  const ListHeader = useCallback(
    () => (
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Header Section</Text>
        <TouchableOpacity style={styles.toggleButton} onPress={toggleEmpty}>
          <Text style={styles.buttonText}>
            {showEmpty ? "Show Items" : "Show Empty"}
          </Text>
        </TouchableOpacity>
      </View>
    ),
    [showEmpty, toggleEmpty]
  );

  const ListFooter = useCallback(
    () => (
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>Footer Section</Text>
      </View>
    ),
    []
  );

  const ListEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No items to display</Text>
        <Text style={styles.emptySubtext}>
          Tap the button above to load items
        </Text>
      </View>
    ),
    []
  );

  const contentContainerStyle = useMemo(() => ({ flexGrow: 1 }), []);

  const handleLoad = useCallback(() => {
    console.log("header footer empty example onLoad");
  }, []);

  return (
    <View style={styles.container}>
      <FlashList
        data={data}
        onLoad={handleLoad}
        renderItem={renderItem}
        contentContainerStyle={contentContainerStyle}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={ListEmpty}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerContainer: {
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 8,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  toggleButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  footerContainer: {
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    marginTop: 8,
  },
  footerText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  itemContainer: {
    backgroundColor: "white",
    padding: 16,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemText: {
    fontSize: 16,
    color: "#333",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
  },
});
