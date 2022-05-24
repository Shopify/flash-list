import React from "react";
import { ListRenderItem, Text } from "react-native";
import "@quilted/react-testing/matchers";
import { mount, Root } from "@quilted/react-testing";

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
export type MockFlashListProps = Omit<
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
  const flashList = mount(
    <FlashList
      {...props}
      renderItem={props?.renderItem || (({ item }) => <Text>{item}</Text>)}
      estimatedItemSize={props?.estimatedItemSize ?? 200}
      data={props?.data || ["One", "Two", "Three", "Four"]}
    />
  ) as Omit<Root<FlashListProps<string>>, "instance"> & {
    instance: FlashList<string>;
  };
  return flashList;
};
