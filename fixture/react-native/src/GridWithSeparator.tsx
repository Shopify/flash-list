import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";

const DATA = Array.from({ length: 10 }, (_, i) => i);

const ItemSeparator = () => <View style={styles.separator} />;

const GridWithSeparator = () => {
  return (
    <FlashList
      data={DATA}
      numColumns={2}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <View style={styles.innerBox} />
          <Text style={styles.label}>Item {item}</Text>
        </View>
      )}
      contentContainerStyle={styles.content}
      keyExtractor={(_, i) => i.toString()}
      ItemSeparatorComponent={ItemSeparator}
    />
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
  },
  item: {
    backgroundColor: "#2E7D32",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  innerBox: {
    backgroundColor: "#1565C0",
    height: 80,
    width: 80,
    borderRadius: 8,
  },
  label: {
    color: "white",
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
  },
  separator: {
    height: 10,
    backgroundColor: "#FFC107",
  },
});

export { GridWithSeparator };
