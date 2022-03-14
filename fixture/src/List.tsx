/** *
 Use this component inside your React Native Application.
 A scrollable list with different item type
 */
import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  LayoutAnimation,
  StyleSheet,
} from "react-native";
import { FlashList } from "@shopify/flash-list";

/** *
 * To test out just copy this component and render in you root component
 */

const generateArray = (size: number) => {
  const arr = new Array(size);
  for (let i = 0; i < size; i++) {
    arr[i] = i;
  }
  return arr;
};

const List = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(generateArray(100));

  const removeItem = (item: number) => {
    setData(
      data.filter((dataItem) => {
        return dataItem !== item;
      })
    );
    // after removing the item, we start animation
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  return (
    <FlashList
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        setTimeout(() => {
          setRefreshing(false);
        }, 2000);
      }}
      keyExtractor={(item: number) => {
        return item.toString();
      }}
      renderItem={({ item }: { item: number }) => {
        const backgroundColor = item % 2 === 0 ? "#00a1f1" : "#ffbb00";
        return (
          <Pressable
            onPress={() => {
              removeItem(item);
            }}
          >
            <View
              style={{
                ...styles.container,
                backgroundColor,
                height: item % 2 === 0 ? 100 : 200,
              }}
            >
              <Text>Cell Id: {item}</Text>
            </View>
          </Pressable>
        );
      }}
      estimatedItemSize={100}
      data={data}
    />
  );
};

export default List;

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-around",
    alignItems: "center",
    height: 120,
    backgroundColor: "#00a1f1",
  },
});
