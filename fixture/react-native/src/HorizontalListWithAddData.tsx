import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, StatusBar } from "react-native";
import { RecyclerView, useRecyclingState } from "@shopify/flash-list";

interface Item {
  id: string;
  title: string;
  color: string;
  timestamp: number;
}

const getRandomColor = (): string => {
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
  return colors[Math.floor(Math.random() * colors.length)];
};

const generateInitialItems = (count: number): Item[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `initial-${i}`,
    title: `Item ${i}`,
    color: getRandomColor(),
    timestamp: Date.now() + i,
  }));
};

// ListItem component that manages its own expanded state
const ListItem = ({ item }: { item: Item }) => {
  const [isExpanded, setIsExpanded] = useRecyclingState(false, [item.id]);

  const handlePress = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <View>
      <Pressable
        style={[
          styles.itemContainer,
          { backgroundColor: item.color },
          isExpanded && {
            height: 230,
          },
        ]}
        onPress={handlePress}
      >
        <Text style={styles.itemText}>{item.title}</Text>
        {isExpanded && <Text style={styles.itemSubtext}>Tap to collapse</Text>}
      </Pressable>
    </View>
  );
};

const Separator = () => <View style={styles.separator} />;

const HorizontalListWithAddData = () => {
  const [data, setData] = useState<Item[]>(generateInitialItems(10));
  const [frontCounter, setFrontCounter] = useState(0);
  const [backCounter, setBackCounter] = useState(0);

  // Add item to the front of the list
  const addToFront = useCallback(() => {
    const newItem: Item = {
      id: `front-${frontCounter}`,
      title: `Front ${frontCounter}`,
      color: getRandomColor(),
      timestamp: Date.now(),
    };
    setData((prevData) => [newItem, ...prevData]);
    setFrontCounter((prev) => prev + 1);
  }, [frontCounter]);

  // Add item to the back of the list
  const addToBack = useCallback(() => {
    const newItem: Item = {
      id: `back-${backCounter}`,
      title: `Back ${backCounter}`,
      color: getRandomColor(),
      timestamp: Date.now(),
    };
    setData((prevData) => [...prevData, newItem]);
    setBackCounter((prev) => prev + 1);
  }, [backCounter]);

  // Clear all items
  const clearList = useCallback(() => {
    setData([]);
    setFrontCounter(0);
    setBackCounter(0);
  }, []);

  // Reset to initial data
  const resetList = useCallback(() => {
    setData(generateInitialItems(10));
    setFrontCounter(0);
    setBackCounter(0);
  }, []);

  // Memoize the renderItem function
  const renderItem = useCallback(
    ({ item }: { item: Item }) => <ListItem item={item} />,
    []
  );

  // Memoize the keyExtractor function
  const keyExtractor = useCallback((item: Item) => item.id, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.header}>Horizontal List - Add Data Example</Text>

      {/* Control buttons */}
      <View style={styles.buttonContainer}>
        <Pressable style={styles.button} onPress={addToFront}>
          <Text style={styles.buttonText}>Add to Front</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={addToBack}>
          <Text style={styles.buttonText}>Add to Back</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.secondaryButton]}
          onPress={clearList}
        >
          <Text style={styles.buttonText}>Clear</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.secondaryButton]}
          onPress={resetList}
        >
          <Text style={styles.buttonText}>Reset</Text>
        </Pressable>
      </View>

      <Text style={styles.itemCount}>Total items: {data.length}</Text>

      {/* Horizontal RecyclerView */}
      <RecyclerView
        testID="HorizontalListWithAddDataScreen"
        horizontal
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={Separator}
        estimatedItemSize={150}
        showsHorizontalScrollIndicator
      />

      <Text style={styles.description}>
        This example demonstrates a horizontal scrolling list with dynamic data
        management. Tap buttons to add items to the front or back of the list.
        Items can be tapped to expand/collapse.
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
    marginBottom: 8,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  button: {
    backgroundColor: "#448AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  secondaryButton: {
    backgroundColor: "#FF6E40",
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  itemCount: {
    fontSize: 14,
    color: "#666",
    paddingHorizontal: 16,
    paddingBottom: 12,
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
  itemSubtext: {
    color: "white",
    fontSize: 12,
    marginTop: 8,
    opacity: 0.9,
  },
  separator: {
    width: 1,
    height: "80%",
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    alignSelf: "center",
    marginHorizontal: 2,
    borderRadius: 5,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#666",
    margin: 16,
  },
});

export default HorizontalListWithAddData;
