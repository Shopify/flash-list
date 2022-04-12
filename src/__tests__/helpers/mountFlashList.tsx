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

import FlashList, { FlashListProps } from "../../FlashList";

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

/**
 * Helper to mount FlashList for testing.
 */
export const mountFlashList = (props?: {
  horizontal?: boolean;
  keyExtractor?: (item: string, index: number) => string;
  initialScrollIndex?: number;
  numColumns?: number;
  estimatedFirstItemOffset?: number;
  data?: string[];
  renderItem?: ListRenderItem<string>;
  onLoad?: (info: { elapsedTimeInMs: number }) => void;
  overrideItemLayout?: (
    layout: { span?: number; size?: number },
    item: string,
    index: number,
    maxColumns: number,
    extraData?: any
  ) => void;
  estimatedItemSize?: number;
  ListEmptyComponent?: FlashListProps<string>["ListEmptyComponent"];
  viewabilityConfig?: ViewabilityConfig | null;
  onViewableItemsChanged?:
    | ((info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => void)
    | null
    | undefined;
  viewabilityConfigCallbackPairs?: ViewabilityConfigCallbackPairs;
}) => {
  const flashList = mount(
    <FlashList
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
      viewabilityConfig={props?.viewabilityConfig}
      onViewableItemsChanged={props?.onViewableItemsChanged}
      viewabilityConfigCallbackPairs={props?.viewabilityConfigCallbackPairs}
    />
  ) as Omit<RootNode<FlashListProps<string>>, "instance"> & {
    instance: FlashList<string>;
  };
  return flashList;
};
