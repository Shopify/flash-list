import React, { createRef } from "react";
import { Text, View } from "react-native";
import "@quilted/react-testing/matchers";
import { render } from "@quilted/react-testing";

import {
  ViewHolderCollection,
  ViewHolderCollectionRef,
} from "../recyclerview/ViewHolderCollection";

describe("ViewHolderCollection", () => {
  it("prevents the absolute item container from being flattened", () => {
    const result = render(
      <ViewHolderCollection
        data={[1]}
        renderStack={new Map([["item-1", { index: 0 }]])}
        getLayout={() => ({
          x: 0,
          y: 0,
          width: 100,
          height: 100,
        })}
        viewHolderCollectionRef={createRef<ViewHolderCollectionRef>()}
        refHolder={new Map()}
        onSizeChanged={jest.fn()}
        renderItem={({ item }) => <Text>{item}</Text>}
        extraData={undefined}
        getChildContainerLayout={() => ({ width: 100, height: 100 })}
        onCommitLayoutEffect={jest.fn()}
        onCommitEffect={jest.fn()}
        horizontal={false}
        getAdjustmentMargin={() => 0}
        currentStickyIndex={-1}
        hideStickyHeaderRelatedCell={false}
        isInLastRow={() => true}
        inverted={false}
      />
    );

    expect(result).toContainReactComponent(View, {
      collapsable: false,
      style: expect.objectContaining({ height: 100, marginTop: 0 }),
    });
  });
});
