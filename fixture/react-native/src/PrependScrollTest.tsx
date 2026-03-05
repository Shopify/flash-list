import React, { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
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
  { index: 0, height: sumOfFirstTwoHeights },
  { index: 1, height: 0 },
  { index: 2, height: beforeLastHeight },
  { index: 3, height: lastHeight },
];

const PrependScrollList = ({
  height,
  allItems,
}: {
  height: number;
  allItems: Item[];
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
              backgroundColor:
                item.index === 3
                  ? "green"
                  : item.index % 2 === 0
                  ? "red"
                  : "orange",
            }}
          >
            <Text style={styles.text}>
              Item {item.index} ({item.height}px)
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const PrependScrollTest = () => {
  const [key, setKey] = useState(false);
  return (
    <View style={styles.container}>
      <Button title="Reset" onPress={() => setKey(!key)} />
      <Text style={styles.info}>
        Green item (initial) should stay visible after prepend
      </Text>
      <PrependScrollList key={`${key}`} height={viewHeight} allItems={items} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  info: {
    padding: 8,
    fontSize: 14,
    textAlign: "center",
  },
  text: {
    fontSize: 18,
    lineHeight: 28,
    color: "white",
    padding: 8,
  },
});

export default PrependScrollTest;
