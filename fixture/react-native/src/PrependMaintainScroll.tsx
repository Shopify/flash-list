import React, { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";

interface Item {
  index: number;
  height: number;
}

const drawDistance = 250;
const viewHeight = 501;
const lastHeight = viewHeight;
const beforeLastHeight = 351 + (7 * viewHeight + lastHeight) / 5;
const sumOfFirstTwoHeights = 501 + viewHeight;

const items: Item[] = [
  { index: 0, height: sumOfFirstTwoHeights - 0 },
  { index: 1, height: 0 },
  { index: 2, height: beforeLastHeight },
  { index: 3, height: lastHeight },
];

const PrependMaintainScroll = () => {
  const [key, setKey] = useState(false);

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.button}
        onPress={() => setKey((prev) => !prev)}
        testID="ResetButton"
      >
        <Text style={styles.buttonText}>Reset</Text>
      </Pressable>
      <List key={`${key}`} height={viewHeight} items={items} />
    </View>
  );
};

const List = ({
  height,
  items: allItems,
}: {
  height: number;
  items: Item[];
}) => {
  const [firstVisibleIndex, setFirstVisibleIndex] = useState(() => {
    return Math.max(allItems.length - 1, 0);
  });

  const visibleItems =
    firstVisibleIndex > 0 ? allItems.slice(firstVisibleIndex) : allItems;

  const prependAllItems = () => setFirstVisibleIndex(0);

  useEffect(() => {
    const timer = setTimeout(prependAllItems, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={{ height }}>
      <FlashList
        drawDistance={drawDistance}
        data={visibleItems}
        keyExtractor={(item) => item.index.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              height: item.height,
              backgroundColor: item.index % 2 === 0 ? "red" : "green",
            }}
          >
            <Text style={styles.text}>{item.height}px</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    padding: 12,
    margin: 8,
    backgroundColor: "#007AFF",
    alignItems: "center",
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  text: {
    fontSize: 18,
    lineHeight: 28,
    color: "white",
  },
});

export default PrependMaintainScroll;
