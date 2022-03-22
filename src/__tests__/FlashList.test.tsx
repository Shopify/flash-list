import React from "react";
import { ScrollView, Text } from "react-native";
import "@quilted/react-testing/matchers";
import { mount } from "@quilted/react-testing";
import { ProgressiveListView } from "recyclerlistview";

import FlashList from "../FlashList";
import Warnings from "../errors/Warnings";

describe("FlashList", () => {
  const mountFlashList = (props?: {
    horizontal?: boolean;
    keyExtractor?: (item: string, index: number) => string;
  }) => {
    const flashList = mount(
      <FlashList
        horizontal={props?.horizontal}
        keyExtractor={props?.keyExtractor}
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
    return flashList;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders items", () => {
    const flashList = mountFlashList();
    expect(flashList).toContainReactComponent(Text, { children: "One" });
    expect(flashList).toContainReactComponent(ProgressiveListView, {
      isHorizontal: false,
    });
  });

  it("sets ProgressiveListView to horizontal", () => {
    const flashList = mountFlashList({ horizontal: true });
    expect(flashList).toContainReactComponent(ProgressiveListView, {
      isHorizontal: true,
    });
  });

  it("calls prepareForLayoutAnimationRender", () => {
    const flashList = mountFlashList({
      keyExtractor: (item) => item,
    });
    const warn = jest.spyOn(console, "warn");
    const prepareForLayoutAnimationRender = jest.spyOn(
      flashList.instance.rlvRef,
      "prepareForLayoutAnimationRender"
    );
    flashList.instance.prepareForLayoutAnimationRender();
    expect(prepareForLayoutAnimationRender).toHaveBeenCalledTimes(1);
    expect(warn).not.toHaveBeenCalled();
  });

  it("sends a warning when prepareForLayoutAnimationRender without keyExtractor", () => {
    const flashList = mountFlashList();
    const warn = jest.spyOn(console, "warn");
    const prepareForLayoutAnimationRender = jest.spyOn(
      flashList.instance.rlvRef,
      "prepareForLayoutAnimationRender"
    );
    flashList.instance.prepareForLayoutAnimationRender();
    expect(prepareForLayoutAnimationRender).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(Warnings.missingKeyExtractor);
  });
});
