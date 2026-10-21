import React, { createRef } from "react";
import { Text } from "react-native";
import "@quilted/react-testing/matchers";
import { render } from "@quilted/react-testing";

import {
  ViewHolderCollection,
  ViewHolderCollectionRef,
} from "../recyclerview/ViewHolderCollection";
import { RVLayout } from "../recyclerview/layout-managers/LayoutManager";

/**
 * Renders a ViewHolderCollection whose layout table covers only the first
 * `layoutCount` indices, mirroring the window between a layout-table shrink
 * and the render-stack prune that follows it.
 */
const renderCollection = (config: {
  dataLength: number;
  renderStackIndices: number[];
  layoutCount: number;
}) => {
  const { dataLength, renderStackIndices, layoutCount } = config;

  const data = Array.from(
    { length: dataLength },
    (_, index) => `item-${index}`
  );
  const renderStack = new Map(
    renderStackIndices.map((index) => [`key-${index}`, { index }])
  );

  const getLayout = (index: number): RVLayout | undefined =>
    index < layoutCount
      ? { x: 0, y: index * 50, width: 400, height: 50 }
      : undefined;

  return render(
    <ViewHolderCollection
      data={data}
      renderStack={renderStack}
      getLayout={getLayout}
      viewHolderCollectionRef={createRef<ViewHolderCollectionRef>()}
      refHolder={new Map()}
      onSizeChanged={jest.fn()}
      renderItem={({ item }) => <Text>{String(item)}</Text>}
      extraData={undefined}
      getChildContainerLayout={() => ({ width: 400, height: 500 })}
      onCommitLayoutEffect={jest.fn()}
      onCommitEffect={jest.fn()}
      horizontal={false}
      getAdjustmentMargin={() => 0}
      currentStickyIndex={-1}
      hideStickyHeaderRelatedCell={false}
      isInLastRow={() => false}
      inverted={false}
    />
  );
};

describe("ViewHolderCollection", () => {
  it("renders every entry while the layout table covers the render stack", () => {
    const collection = renderCollection({
      dataLength: 10,
      renderStackIndices: [0, 1, 2, 3, 4],
      layoutCount: 10,
    });

    expect(collection.findAll(Text)).toHaveLength(5);
  });

  it("renders only the entries that still have a layout after a shrink", () => {
    // The stack still holds indices up to 24 from before the shrink, while
    // data and layouts have already been truncated to 10. Without the guard
    // the stale entries render as empty rows off the end of the list.
    const collection = renderCollection({
      dataLength: 10,
      renderStackIndices: Array.from({ length: 25 }, (_, index) => index),
      layoutCount: 10,
    });

    expect(collection.findAll(Text).map((node) => node.text)).toStrictEqual(
      Array.from({ length: 10 }, (_, index) => `item-${index}`)
    );
  });
});
