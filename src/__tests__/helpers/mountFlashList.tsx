import React from "react";
import {
  ListRenderItem,
  Text,
  ViewabilityConfig,
  ViewabilityConfigCallbackPairs,
  ViewToken,
} from "react-native";
import "@quilted/react-testing/matchers";
import { mount, RootNode } from "@quilted/react-testing";

import FlashList from "../../FlashList";
import { FlashListProps } from "../../FlashListProps";

jest.mock("../../FlashList", () => {
  const ActualFlashList = jest.requireActual("../../FlashList").default;
  class MockFlashList extends ActualFlashList {
    componentDidMount() {
      super.componentDidMount();
      this.rlvRef?._scrollComponent?._scrollViewRef?.props.onLayout({
        nativeEvent: { layout: { height: 900, width: 400 } },
      });
    }
  }
  return MockFlashList;
});
type MockFlashListProps = Omit<
  FlashListProps<string>,
  "estimatedItemSize" | "data" | "renderItem"
> & {
  estimatedItemSize?: number;
  data?: string[];
  renderItem?: ListRenderItem<string>;
};
/**
 * Helper to mount FlashList for testing.
 */
export const mountFlashList = (
  props?: MockFlashListProps,
  ref?: React.RefObject<FlashList<string>>
) => {
  const flashList = mount(renderMockFlashList(props)) as Omit<
    RootNode<FlashListProps<string>>,
    "instance"
  > & {
    instance: FlashList<string>;
  };
  return flashList;
};

export const renderMockFlashList = (
  props?: MockFlashListProps,
  ref?: React.RefObject<FlashList<string>>
) => {
  return (
    <FlashList
      ref={ref}
      horizontal={props?.horizontal}
      keyExtractor={props?.keyExtractor}
      renderItem={props?.renderItem || (({ item }) => <Text>{item}</Text>)}
      estimatedItemSize={props?.estimatedItemSize ?? 200}
      data={props?.data || ["One", "Two", "Three", "Four"]}
      initialScrollIndex={props?.initialScrollIndex}
      numColumns={props?.numColumns}
      estimatedFirstItemOffset={props?.estimatedFirstItemOffset}
      onLoad={props?.onLoad}
      overrideItemLayout={props?.overrideItemLayout}
      ListEmptyComponent={props?.ListEmptyComponent}
      ListHeaderComponent={props?.ListHeaderComponent}
      ListFooterComponent={props?.ListFooterComponent}
      viewabilityConfig={props?.viewabilityConfig}
      onViewableItemsChanged={props?.onViewableItemsChanged}
      viewabilityConfigCallbackPairs={props?.viewabilityConfigCallbackPairs}
      stickyHeaderIndices={props?.stickyHeaderIndices}
    />
  );
};
