import React from "react";
import { ScrollView, Text } from "react-native";
import "@quilted/react-testing/matchers";
import { mount } from "@quilted/react-testing";
import { ProgressiveListView } from "recyclerlistview";

import FlashList from "../FlashList";

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
    flashList.findAll(ScrollView)[0].trigger("onLayout", {
      nativeEvent: { layout: { height: 900, width: 400 } },
    });
    expect(flashList).toContainReactComponent(Text, { children: "One" });
    expect(flashList).toContainReactComponent(ProgressiveListView, {
      isHorizontal: false,
    });
  });

  it("sets ProgressiveListView to horizontal", () => {
    const flashList = mount(
      <FlashList
        horizontal
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
