import React from "react";
import { Text, View } from "react-native";
import "@quilted/react-testing/matchers";
import { render } from "@quilted/react-testing";

import { FlashList } from "..";

jest.mock("../recyclerview/utils/measureLayout", () => {
  const originalModule = jest.requireActual(
    "../recyclerview/utils/measureLayout"
  );
  return {
    ...originalModule,
    measureParentSize: jest.fn().mockImplementation(() => ({
      width: 399,
      height: 899,
    })),
    measureFirstChildLayout: jest.fn().mockImplementation(() => ({
      x: 0,
      y: 0,
      width: 399,
      height: 899,
    })),
    measureItemLayout: jest.fn().mockImplementation(() => ({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    })),
  };
});

const Separator = () => <View style={{ width: 10 }} />;

/**
 * Returns, for every rendered cell, whether the separator sits before or after
 * the item inside the cell. Cells are keyed by their item index.
 */
const separatorPlacementByIndex = (result: ReturnType<typeof render>) => {
  const placement = new Map<number, "before" | "after" | "none">();
  for (const cell of result.findAllWhere(
    (node: any) => node.type === View && typeof node.props.index === "number"
  )) {
    const index = (cell as any).props.index as number;
    if (placement.has(index)) continue;
    const childTypes = React.Children.toArray((cell as any).props.children).map(
      (child: any) => child.type
    );
    const itemAt = childTypes.indexOf(Text);
    const separatorAt = childTypes.indexOf(Separator);
    placement.set(
      index,
      separatorAt === -1 ? "none" : separatorAt < itemAt ? "before" : "after"
    );
  }
  return placement;
};

const renderList = (inverted: boolean) =>
  render(
    <FlashList
      data={[0, 1, 2, 3]}
      horizontal
      inverted={inverted}
      overrideProps={{ initialDrawBatchSize: 1 }}
      drawDistance={0}
      renderItem={({ item }) => <Text>{`item-${item}`}</Text>}
      ItemSeparatorComponent={Separator}
    />
  );

describe("ItemSeparatorComponent placement", () => {
  it("renders the separator after the item in a regular list", () => {
    expect([...separatorPlacementByIndex(renderList(false)).entries()]).toEqual(
      [
        [0, "after"],
        [1, "after"],
        [2, "after"],
        [3, "none"],
      ]
    );
  });

  it("renders the separator before the item in an inverted list", () => {
    // Both the scroller and each cell are flipped, so a trailing separator
    // would visually land between item i and item i - 1, leaving the two
    // items at the far end of the list flush against each other.
    expect([...separatorPlacementByIndex(renderList(true)).entries()]).toEqual([
      [0, "before"],
      [1, "before"],
      [2, "before"],
      [3, "none"],
    ]);
  });
});
