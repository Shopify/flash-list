import React from "react";
import { ScrollView, Text } from "react-native";
import "@quilted/react-testing/matchers";
import { mount } from "@quilted/react-testing";

import FlashList from "../FlashList";
import { ProgressiveListView } from "recyclerlistview";

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
      />
    );
    flashList
      .findAll(ScrollView)
      .at(0)!
      .trigger("onLayout", {
        nativeEvent: { layout: { height: 900, width: 400 } },
      });
    expect(flashList).toContainReactComponent(Text, { children: "One" });
  });

  it("sets ProgressiveListView to horizontal", () => {
    const flashList = mount(
      <FlashList
        horizontal={true}
        renderItem={(text) => {
          return <Text>{text.item}</Text>;
        }}
        estimatedItemSize={200}
        data={["One", "Two"]}
      />
    );
    expect(flashList).toContainReactComponent(ProgressiveListView, {
      isHorizontal: true,
    });
  });
});
