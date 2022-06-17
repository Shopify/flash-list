/** *
Sample list for web
 */
import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { FlashList, ListRenderItemInfo } from "@shopify/flash-list";

const ListItem = ({ index }: { index: string }) => {
  const [height, setHeight] = useState(100);
  useEffect(() => {
    setHeight(100);
  }, [index]);
  return (
    <Pressable
      onPress={() => {
        if (height === 100) {
          setHeight(200);
        } else {
          setHeight(100);
        }
      }}
      style={{ height }}
    >
      <View style={styles.container}>
        <Text>
          Web Item: {index}, size: {height}
        </Text>
      </View>
    </Pressable>
  );
};

const List = () => {
  const flashListRef = useRef<FlashList<number>>(null);
  const renderItem = ({ index }: ListRenderItemInfo<number>) => {
    return <ListItem index={index.toString()} />;
  };

  return (
    <FlashList
      ref={flashListRef}
      renderItem={renderItem}
      estimatedItemSize={150}
      stickyHeaderIndices={[0, 3, 6, 7, 9]}
      data={new Array<number>(100)}
      ListFooterComponent={<ListItem index="Footer" />}
      ListHeaderComponent={<ListItem index="Header" />}
    />
  );
};

export default List;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "cyan",
    borderWidth: 2,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "space-around",
  },
});
