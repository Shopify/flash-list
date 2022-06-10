/** *
Sample list for web
 */
import React, { useRef, useState } from "react";
import { View, Text } from "react-native";
import { FlashList, ListRenderItemInfo } from "@shopify/flash-list";

const List = () => {
  const renderItem = ({ index }: ListRenderItemInfo<number>) => {
    return (
      <View
        style={{
          height: 120,
          backgroundColor: "cyan",
          borderWidth: 5,
          borderColor: "white",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        <Text>Web Item: {index}</Text>
      </View>
    );
  };

  return (
    <FlashList
      renderItem={renderItem}
      estimatedItemSize={150}
      stickyHeaderIndices={[0, 3, 6, 7, 9]}
      data={new Array<number>(100)}
    />
  );
};

export default List;
