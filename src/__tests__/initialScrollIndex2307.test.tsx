import React from "react";
import { Text } from "react-native";
import "@quilted/react-testing/matchers";
import { render } from "@quilted/react-testing";

import { FlashList } from "..";

// Items are 300px tall, which is above the 200px default the layout manager
// seeds unmeasured items with. That gap is what issue #2307 depends on.
jest.mock("../recyclerview/utils/measureLayout", () => {
  const originalModule = jest.requireActual(
    "../recyclerview/utils/measureLayout"
  );
  return {
    ...originalModule,
    measureParentSize: jest
      .fn()
      .mockImplementation(() => ({ width: 400, height: 900 })),
    measureFirstChildLayout: jest
      .fn()
      .mockImplementation(() => ({ x: 0, y: 0, width: 400, height: 900 })),
    measureItemLayout: jest
      .fn()
      .mockImplementation(() => ({ x: 0, y: 0, width: 400, height: 300 })),
  };
});

describe("initialScrollIndex with items taller than the default estimate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  it("opens on the requested item rather than one far past it", () => {
    const result = render(
      <FlashList
        data={Array.from({ length: 600 }, (_, index) => index)}
        keyExtractor={(item) => String(item)}
        initialScrollIndex={250}
        renderItem={({ item }) => <Text>{item}</Text>}
        overrideProps={{ initialDrawBatchSize: 1 }}
        drawDistance={0}
      />
    );

    expect(result).toContainReactComponent(Text, { children: 250 });
    expect(result).not.toContainReactComponent(Text, { children: 333 });
  });
});
