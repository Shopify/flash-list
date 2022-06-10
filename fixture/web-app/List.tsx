/** *
Sample list for web
 */
import React, { useRef, useState } from "react";
import { View, Text } from "react-native";
import { FlashList, ListRenderItemInfo } from "@shopify/flash-list";
import { Pressable } from "react-native";

const ListItem = ({ index }: { index: string }) => {
  const [height, setHeight] = useState(120);
  return (
    <Pressable
      onPress={() => {
        setHeight(200);
      }}
    >
      <View
        style={{
          height: height,
          backgroundColor: "cyan",
          borderWidth: 5,
          borderColor: "white",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        <Text>Web Item: {index}</Text>
      </View>
    </Pressable>
  );
};

const List = () => {
  const renderItem = ({ index }: ListRenderItemInfo<number>) => {
    return <ListItem index={index.toString()} />;
  };

  return (
    <FlashList
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
