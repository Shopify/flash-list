import React, { useEffect, useState, useCallback, useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { RecyclerView } from "@shopify/flash-list";

interface Item {
  id: string;
  index: number;
}

let id = 0;

const ItemRenderer = ({ item }: { item: Item }) => {
  const [id, setId] = useState(item.id);
  // log mount and unmount
  useEffect(() => {
    console.log("ItemRenderer mounted");
    return () => {
      console.log("ItemRenderer unmounted");
    };
  }, []);
  return (
    <View style={styles.itemContainer}>
      <Text style={styles.text}>Index: {item.index}</Text>
      <Text style={styles.text}>Data ID: {item.id}</Text>
      <Text style={styles.text}>View ID: {id}</Text>
    </View>
  );
};

const generateItems = (size: number): Item[] => {
  return Array.from({ length: size }, (_, index) => ({
    id: `item-${id++}`,
    index,
  }));
};

const DynamicItems = () => {
  useEffect(() => {
    return () => {
      id = 0;
    };
  }, []);
  const [items, setItems] = useState<Item[]>(() => generateItems(20));

  const addItems = () => {
    setItems((prevItems) => [
      ...prevItems,
      ...generateItems(5).map((item, idx) => ({
        ...item,
        index: prevItems.length + idx,
      })),
    ]);
  };

  const removeItems = () => {
    setItems((prevItems) =>
      prevItems.length >= 5 ? prevItems.slice(0, -5) : prevItems
    );
  };

  const renderItem = useCallback(
    ({ item }: { item: Item }) => <ItemRenderer item={item} />,
    []
  );

  const keyExtractor = useCallback((item: Item) => item.id, []);

  const ListEmptyComponent = useCallback(() => <Text>No items</Text>, []);

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Pressable style={styles.button} onPress={removeItems}>
          <Text style={styles.buttonText}>Remove 5 Items</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={addItems}>
          <Text style={styles.buttonText}>Add 5 Items</Text>
        </Pressable>
      </View>
      <RecyclerView
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={ListEmptyComponent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    backgroundColor: "#f0f0f0",
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 5,
    minWidth: 120,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  itemContainer: {
    backgroundColor: "#e1e1e1",
    padding: 16,
    margin: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  text: {
    fontSize: 16,
    marginVertical: 2,
  },
});

export default DynamicItems;
