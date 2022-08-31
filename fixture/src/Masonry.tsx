import React, { useRef } from "react";
import { Text, View, StyleSheet, Platform, Dimensions } from "react-native";
import { MasonryFlashList } from "@shopify/flash-list";

interface MasonryData {
  index: number;
  height: number;
}

export function Masonry() {
  const data: MasonryData[] = new Array(1000).fill(null).map((_, index) => {
    return { index, height: ((index * 10) % 100) + 100 };
  });
  return (
    <View style={styles.container}>
      <MasonryFlashList
        data={data}
        numColumns={3}
        estimatedItemSize={150}
        ListHeaderComponent={
          <Component
            item={{ index: 0, height: 100 }}
            text="Header"
            backgroundColor="red"
          />
        }
        ListFooterComponent={
          <Component
            item={{ index: 0, height: 100 }}
            text="Header"
            backgroundColor="blue"
          />
        }
        onViewableItemsChanged={(info) => {
          info.changed.forEach((item) => {
            if (item.isViewable) {
              console.log(item.index);
            }
          });
        }}
        getItemType={(item, index) => {
          if (item.index !== index) {
            console.log(index);
          }
          return undefined;
        }}
        renderItem={({ item, index }) => {
          return <Component item={item} />;
        }}
      />
    </View>
  );
}

const Component = (props: {
  item: MasonryData;
  text?: string;
  backgroundColor?: string;
}) => {
  return (
    <View
      style={{
        height: props.item.height,
        backgroundColor: props.backgroundColor ?? "darkgray",
        margin: 2,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
      }}
    >
      <Text>{props.text ?? props.item.index}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: Platform.OS === "web" ? undefined : 1,
    height: Platform.OS === "web" ? window.innerHeight : undefined,
    justifyContent: "center",
    backgroundColor: "#ecf0f1",
    paddingHorizontal: 2,
  },
});
