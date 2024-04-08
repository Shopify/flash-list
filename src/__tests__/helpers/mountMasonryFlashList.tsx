import React from "react";
import { Text } from "react-native";
import "@quilted/react-testing/matchers";
import { render, Root } from "@quilted/react-testing";

import { ListRenderItem } from "../../FlashListProps";
import {
  MasonryFlashList,
  MasonryFlashListProps,
  MasonryFlashListRef,
} from "../../MasonryFlashList";

jest.mock("../../FlashList", () => {
  const ActualFlashList = jest.requireActual("../../FlashList").default;
  class MockFlashList extends ActualFlashList {
    componentDidMount() {
      super.componentDidMount();
      this.rlvRef?._scrollComponent?._scrollViewRef?.props.onLayout({
        nativeEvent: {
          layout: {
            height: this.props.estimatedListSize?.height ?? 900,
            width: this.props.estimatedListSize?.width ?? 400,
          },
        },
      });
    }
  }
  return MockFlashList;
});

export type MockMasonryFlashListProps = Omit<
  MasonryFlashListProps<string>,
  "estimatedItemSize" | "data" | "renderItem"
> & {
  estimatedItemSize?: number;
  data?: string[];
  renderItem?: ListRenderItem<string>;
};

/**
 * Helper to mount MasonryFlashList for testing.
 */
export const mountMasonryFlashList = (
  props?: MockMasonryFlashListProps,
  ref?: React.RefObject<MasonryFlashListRef<string>>
) => {
  const flashList = render(renderMasonryFlashList(props, ref)) as Omit<
    Root<MasonryFlashListProps<string>>,
    "instance"
  > & {
    instance: MasonryFlashListRef<string>;
  };
  return flashList;
};

export function renderMasonryFlashList(
  props?: MockMasonryFlashListProps,
  ref?: React.RefObject<MasonryFlashListRef<string>>
) {
  return (
    <MasonryFlashList
      {...props}
      ref={ref}
      numColumns={props?.numColumns ?? 2}
      renderItem={props?.renderItem || (({ item }) => <Text>{item}</Text>)}
      estimatedItemSize={props?.estimatedItemSize ?? 200}
      data={props?.data || ["One", "Two", "Three", "Four"]}
    />
  );
}
