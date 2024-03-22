import React from "react";
import { Text } from "react-native";
import "@quilted/react-testing/matchers";
import { render, Root } from "@quilted/react-testing";

import FlashList from "../../FlashList";
import { FlashListProps, ListRenderItem } from "../../FlashListProps";

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
  disableDefaultEstimatedItemSize?: boolean;
};
/**
 * Helper to mount FlashList for testing.
 */
export const mountFlashList = (
  props?: MockFlashListProps,
  ref?: React.RefObject<FlashList<string>>
) => {
  const flashList = render(renderFlashList(props, ref)) as Omit<
    Root<FlashListProps<string>>,
    "instance"
  > & {
    instance: FlashList<string>;
  };
  return flashList;
};

export function renderFlashList(
  props?: MockFlashListProps,
  ref?: React.RefObject<FlashList<string>>
) {
  return (
    <FlashList
      {...props}
      ref={ref}
      renderItem={props?.renderItem || (({ item }) => <Text>{item}</Text>)}
      estimatedItemSize={
        props?.estimatedItemSize ??
        (props?.disableDefaultEstimatedItemSize ? undefined : 200)
      }
      data={props?.data || ["One", "Two", "Three", "Four"]}
    />
  );
}
