import React from "react";
import { createElement, FlatList, ScrollView, Text } from "react-native";
import "@quilted/react-testing/matchers";
import { createMount, mount } from "@quilted/react-testing";

import FlashList from "../FlashList";

interface Config {}
interface Context {}

describe("FlashList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders items", () => {
    const flashList = mount(
      <FlashList
        renderItem={(text) => {
          return <Text>{text.item}</Text>;
        }}
        estimatedItemSize={200}
        data={["One", "Two"]}
      />,
      {}
    );
    flashList
      .findAll(ScrollView)
      .at(0)!
      .trigger("onLayout", {
        nativeEvent: { layout: { height: 900, width: 400 } },
      });
    expect(flashList).toContainReactComponent(Text, { children: "One" });
  });
});
