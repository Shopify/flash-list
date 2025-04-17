import React from "react";
import { Text } from "react-native";
import "@quilted/react-testing/matchers";
import { render } from "@quilted/react-testing";

import { RecyclerView } from "../recyclerview/RecyclerView";

// Mock measureLayout to return fixed dimensions
jest.mock("../recyclerview/utils/measureLayout", () => {
  const originalModule = jest.requireActual(
    "../recyclerview/utils/measureLayout"
  );
  return {
    ...originalModule,
    measureParentSize: jest.fn().mockImplementation(() => ({
      x: 0,
      y: 0,
      width: 400,
      height: 900,
    })),
    measureChildContainerLayout: jest.fn().mockImplementation(() => ({
      x: 0,
      y: 0,
      width: 400,
      height: 900,
    })),
    measureItemLayout: jest.fn().mockImplementation(() => ({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    })),
  };
});

describe("RecyclerView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  it("renders items ", () => {
    const result = render(
      <RecyclerView
        data={[
          "One",
          "Two",
          "Three",
          "Four",
          "Five",
          "Six",
          "Seven",
          "Eight",
          "Nine",
          "Ten",
          "Eleven",
          "Twelve",
          "Thirteen",
          "Fourteen",
          "Fifteen",
        ]}
        renderItem={({ item }) => <Text>{item}</Text>}
      />
    );

    expect(result).toContainReactComponent(Text, { children: "One" });
    expect(result).not.toContainReactComponent(Text, { children: "Eleven" });
  });
});
