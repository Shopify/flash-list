import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { RecyclerView } from "../../../src";

// Define our item type
interface Item {
  id: string;
  title: string;
  subtitle: string;
  height?: number;
  color: string;
}

// Generate random items with varying heights
const generateItems = (count: number): Item[] => {
  const colors = [
    "#FFB6C1",
    "#FFA07A",
    "#FFDAB9",
    "#FFFACD",
    "#E0FFFF",
    "#B0E0E6",
    "#D8BFD8",
    "#DDA0DD",
    "#F0E68C",
    "#90EE90",
    "#98FB98",
    "#AFEEEE",
    "#B0C4DE",
    "#D3D3D3",
    "#FFC0CB",
  ];

  return Array.from({ length: count }).map((_, i) => ({
    id: `item-${i}`,
    title: `Item ${i}`,
    subtitle: `This is a detailed description for item ${i}`,
    height: (i % 3) * 50 + 100, // Random heights: 100, 150, or 200
    color: colors[i % colors.length],
  }));
};

const RecyclerViewHandlerTest = () => {
  const [items, setItems] = useState<Item[]>(generateItems(100));
  const [horizontal, setHorizontal] = useState(false);
  const [lastAction, setLastAction] = useState("None");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Reference to the FlashList
  const listRef = useRef<any>(null);

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);

    // Simulate network request
    setTimeout(() => {
      setItems(generateItems(100));
      setIsRefreshing(false);
      setLastAction("Refreshed list");
    }, 1500);
  };

  // Scroll methods
  const scrollToOffset = (offset: number, animated: boolean = true) => {
    if (listRef.current) {
      listRef.current.scrollToOffset({
        offset,
        animated,
      });
      setLastAction(`Scrolled to offset: ${offset}, animated: ${animated}`);
    }
  };

  const scrollToIndex = (
    index: number,
    animated: boolean = true,
    viewPosition?: number,
    viewOffset?: number
  ) => {
    if (listRef.current) {
      listRef.current.scrollToIndex({
        index,
        animated,
        viewPosition,
        viewOffset,
      });

      let actionText = `Scrolled to index: ${index}, animated: ${animated}`;
      if (viewPosition !== undefined)
        actionText += `, viewPosition: ${viewPosition}`;
      if (viewOffset !== undefined) actionText += `, viewOffset: ${viewOffset}`;

      setLastAction(actionText);
    }
  };

  const scrollToItem = (
    item: Item,
    animated: boolean = true,
    viewPosition?: number,
    viewOffset?: number
  ) => {
    if (listRef.current) {
      listRef.current.scrollToItem({
        item,
        animated,
        viewPosition,
        viewOffset,
      });

      let actionText = `Scrolled to item: ${item.title}, animated: ${animated}`;
      if (viewPosition !== undefined)
        actionText += `, viewPosition: ${viewPosition}`;
      if (viewOffset !== undefined) actionText += `, viewOffset: ${viewOffset}`;

      setLastAction(actionText);
    }
  };

  const scrollToEnd = (animated: boolean = true) => {
    if (listRef.current) {
      listRef.current.scrollToEnd({
        animated,
      });
      setLastAction(`Scrolled to end, animated: ${animated}`);
    }
  };

  const flashScrollIndicators = () => {
    if (listRef.current) {
      listRef.current.flashScrollIndicators();
      setLastAction("Flashed scroll indicators");
    }
  };

  // Render item
  const renderItem = ({ item, index }: { item: Item; index: number }) => {
    return (
      <TouchableOpacity
        style={[
          styles.item,
          {
            backgroundColor: item.color,
            height: horizontal ? 150 : item.height,
            width: horizontal ? item.height : "100%",
          },
        ]}
        onPress={() => scrollToItem(item, true, 0)}
      >
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
        <Text style={styles.itemIndex}>Index: {index}</Text>
      </TouchableOpacity>
    );
  };

  // Header component
  const ListHeaderComponent = () => (
    <View style={[styles.header, horizontal ? styles.horizontalHeader : {}]}>
      <Text style={styles.headerText}>List Header</Text>
    </View>
  );

  // Footer component
  const ListFooterComponent = () => (
    <View style={[styles.footer, horizontal ? styles.horizontalFooter : {}]}>
      <Text style={styles.footerText}>List Footer</Text>
    </View>
  );

  // Empty component
  const ListEmptyComponent = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>No items available</Text>
    </View>
  );

  // Separator component
  const ItemSeparatorComponent = () => (
    <View
      style={[styles.separator, horizontal ? styles.horizontalSeparator : {}]}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContainer}>
        {/* Control Panel - Now a vertical column on the left */}
        <ScrollView style={styles.controlPanel}>
          <View style={styles.lastActionContainer}>
            <Text style={styles.lastActionTitle}>Last Action:</Text>
            <Text style={styles.lastActionText}>{lastAction}</Text>
          </View>
          <View style={styles.controlRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setHorizontal(!horizontal)}
            >
              <Text style={styles.buttonText}>
                {horizontal ? "Switch to Vertical" : "Switch to Horizontal"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.controlRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => scrollToOffset(500)}
            >
              <Text style={styles.buttonText}>Scroll to Offset 500</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.controlRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => scrollToOffset(1000, false)}
            >
              <Text style={styles.buttonText}>
                Scroll to 1000 (No Animation)
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.controlRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => scrollToIndex(20)}
            >
              <Text style={styles.buttonText}>Scroll to Index 20</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.controlRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => scrollToIndex(50, true, 0.5)}
            >
              <Text style={styles.buttonText}>
                Scroll to Index 50 (Centered)
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.controlRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => scrollToIndex(75, true, 0, 50)}
            >
              <Text style={styles.buttonText}>
                Scroll to Index 75 (With Offset 50)
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.controlRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => scrollToItem(items[10])}
            >
              <Text style={styles.buttonText}>Scroll to Item 10</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.controlRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => scrollToEnd()}
            >
              <Text style={styles.buttonText}>Scroll to End</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.controlRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => flashScrollIndicators()}
            >
              <Text style={styles.buttonText}>Flash Indicators</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.controlRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setItems([])}
            >
              <Text style={styles.buttonText}>Clear Items</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.controlRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setItems(generateItems(100))}
            >
              <Text style={styles.buttonText}>Reset Items</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* List Container - Now on the right side */}
        <View style={styles.listContainer}>
          {/* Use FlatList instead of FlashList to avoid import issues */}
          <RecyclerView
            ref={listRef}
            data={items}
            renderItem={renderItem}
            horizontal={horizontal}
            ListHeaderComponent={ListHeaderComponent}
            ListFooterComponent={ListFooterComponent}
            ListEmptyComponent={ListEmptyComponent}
            ItemSeparatorComponent={ItemSeparatorComponent}
            onRefresh={handleRefresh}
            refreshing={isRefreshing}
            keyExtractor={(item: Item) => item.id}
            onEndReached={() => setLastAction("End reached")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  controlTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 12,
    color: "#333",
  },
  mainContainer: {
    flex: 1,
    flexDirection: "row", // Side-by-side layout
    padding: 8,
  },
  listContainer: {
    flex: 2, // Takes 2/3 of the space
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
  },
  controlPanel: {
    flex: 1, // Takes 1/3 of the space
    backgroundColor: "white",
    borderRadius: 8,
    marginRight: 8,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  item: {
    padding: 16,
    borderRadius: 8,
    margin: 4,
    justifyContent: "center",
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  itemSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  itemIndex: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 8,
  },
  header: {
    padding: 16,
    backgroundColor: "#4CAF50",
    alignItems: "center",
  },
  horizontalHeader: {
    width: 200,
    height: "100%",
    justifyContent: "center",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  footer: {
    padding: 16,
    backgroundColor: "#2196F3",
    alignItems: "center",
  },
  horizontalFooter: {
    width: 200,
    height: "100%",
    justifyContent: "center",
  },
  footerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#999",
  },
  separator: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 4,
  },
  horizontalSeparator: {
    width: 1,
    height: "100%",
    marginHorizontal: 4,
  },
  controlRow: {
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#3498db",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  lastActionContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#eee",
  },
  lastActionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  lastActionText: {
    fontSize: 14,
  },
});

export default RecyclerViewHandlerTest;
