/** *
 Use this component inside your React Native Application.
 A scrollable list with different item type
 */
import React, { useCallback, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";

const generateArray = (size: number) => {
  const arr = new Array(size);
  for (let i = 0; i < size; i++) {
    arr[i] = i;
  }
  return arr;
};

const List = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(() => generateArray(100));

  const list = useRef<FlashListRef<number> | null>(null);

  const removeItem = useCallback((item: number) => {
    list.current?.prepareForLayoutAnimationRender();

    setData((prevData) => {
      return prevData.filter((dataItem) => {
        return dataItem !== item;
      });
    });
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: number }) => {
      const backgroundColor = item % 2 === 0 ? "#00a1f1" : "#ffbb00";
      console.log("renderItem", item);
      return (
        <Pressable
          onPress={() => {
            removeItem(item);
          }}
        >
          <View
            style={{
              ...styles.container,
              backgroundColor: item > 97 ? "red" : backgroundColor,
              height: item % 2 === 0 ? 100 : 200,
            }}
          >
            <Text>Cell Id: {item}</Text>
          </View>
        </Pressable>
      );
    },
    [removeItem]
  );

  return (
    <FlashList
      ref={list}
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        setTimeout(() => {
          setRefreshing(false);
        }, 2000);
      }}
      CellRendererComponent={CellRenderer}
      keyExtractor={(item: number) => {
        return item.toString();
      }}
      getItemType={(item: number) => {
        return item % 2 === 0 ? "even" : "odd";
      }}
      renderItem={renderItem}
      data={data}
    />
  );
};

export default List;

const CellRenderer = (props: any) => {
  return (
    <Animated.View
      {...props}
      layout={LinearTransition}
      entering={FadeIn}
      exiting={FadeOut}
    />
  );
};
const styles = StyleSheet.create({
  container: {
    justifyContent: "space-around",
    alignItems: "center",
    height: 120,
    backgroundColor: "#00a1f1",
  },
});
