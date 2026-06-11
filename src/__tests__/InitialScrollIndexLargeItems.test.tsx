import React from "react";
import { Text } from "react-native";
import "@quilted/react-testing/matchers";
import { render } from "@quilted/react-testing";

import { FlashList } from "..";

// Items measure at 300px — larger than the layout managers' default
// 200px average estimate. Reproduces #2307: the initial-scroll corrective
// pass used to leave items beyond initialScrollIndex at stale positions,
// breaking the layout table's monotonicity and rendering the wrong items.
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
      width: 399,
      height: 300,
    })),
  };
});

describe("initialScrollIndex with items larger than the default estimate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  it("renders the requested item when item size exceeds the average estimate", () => {
    const data = Array.from({ length: 500 }, (_, index) => index);

    const result = render(
      <FlashList
        data={data}
        initialScrollIndex={250}
        overrideProps={{ initialDrawBatchSize: 1 }}
        drawDistance={0}
        renderItem={({ item }) => <Text>{item}</Text>}
      />
    );

    jest.runAllTimers();

    // The list should open at item 250 — not ~83 indices further down,
    // which is what a non-monotonic layout table produces.
    expect(result).toContainReactComponent(Text, { children: 250 });
    expect(result).not.toContainReactComponent(Text, { children: 333 });
  });
});
