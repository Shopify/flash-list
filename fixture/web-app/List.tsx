/** *
Sample list for web
 */
import React, { useEffect, useRef, useState } from "react";
import { View, Text } from "react-native";
import { FlashList, ListRenderItemInfo } from "@shopify/flash-list";
import { Pressable } from "react-native";

const ListItem = ({
  index,
  update,
}: {
  index: string;
  update?: () => void;
}) => {
  const [height, setHeight] = useState(120);
  useEffect(() => {
    setHeight(120);
  }, [index]);
  return (
    <Pressable
      onPress={() => {
        if (update) {
          setHeight(200);
          // web doesn't have resize observer so this is needed to report size changes
          // we can add resize observer in recyclerlistview and remove this
          update();
        }
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
  const flashListRef = useRef<FlashList<number>>(null);
  const renderItem = ({ index }: ListRenderItemInfo<number>) => {
    return (
      <ListItem
        update={() => {
          flashListRef.current?.recyclerlistview_unsafe?.forceRerender();
        }}
        index={index.toString()}
      />
    );
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
