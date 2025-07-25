import React from "react";
import { Text, View, StyleSheet, Platform } from "react-native";
import { FlashList } from "@shopify/flash-list";

interface MasonryData {
  index: number;
  height: number;
}

export function Masonry() {
  const columnCount = 3;
  const data: MasonryData[] = new Array(999).fill(null).map((_, index) => {
    return {
      index,
      height: ((index * 10) % 100) + 100 / ((index % columnCount) + 1),
    };
  });
  return (
    <React.StrictMode>
      <View style={styles.container}>
        <FlashList
          testID="MasonryList"
          data={data}
          masonry
          numColumns={columnCount}
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
              text="Footer"
              backgroundColor="lightblue"
            />
          }
          ListEmptyComponent={
            <Component
              item={{ index: 0, height: 100 }}
              text="Empty"
              backgroundColor="black"
            />
          }
          onViewableItemsChanged={(info) => {
            info.changed.forEach((item) => {
              if (item.isViewable) {
                console.log("Viewable:", item.index);
              }
            });
          }}
          keyExtractor={(item, index) => {
            if (item.index !== index) {
              console.log("Key Extractor issue @", index);
            }
            return item.index.toString();
          }}
          getItemType={(item, index) => {
            if (item.index !== index) {
              console.log(index);
            }
            return undefined;
          }}
          renderItem={({ item }) => {
            return <Component item={item} />;
          }}
          onLoad={({ elapsedTimeInMs }) => {
            console.log("List Load Time", elapsedTimeInMs);
          }}
          contentContainerStyle={{ paddingHorizontal: 2 }}
        />
      </View>
    </React.StrictMode>
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
  },
});
