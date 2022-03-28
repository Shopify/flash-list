import React from "react";
import { ListRenderItem, ScrollView, Text } from "react-native";
import "@quilted/react-testing/matchers";
import { mount } from "@quilted/react-testing";
import { ProgressiveListView } from "recyclerlistview";

import FlashList from "../FlashList";
import Warnings from "../errors/Warnings";

describe("FlashList", () => {
  const mountFlashList = (props?: {
    horizontal?: boolean;
    keyExtractor?: (item: string, index: number) => string;
    initialScrollIndex?: number;
    numColumns?: number;
    estimatedFirstItemOffset?: number;
    data?: string[];
    renderItem?: ListRenderItem<string>;
  }) => {
    const flashList = mount(
      <FlashList
        horizontal={props?.horizontal}
        keyExtractor={props?.keyExtractor}
        renderItem={props?.renderItem || (({ item }) => <Text>{item}</Text>)}
        estimatedItemSize={200}
        data={props?.data || ["One", "Two", "Three", "Four"]}
        initialScrollIndex={props?.initialScrollIndex}
        numColumns={props?.numColumns}
        estimatedFirstItemOffset={props?.estimatedFirstItemOffset}
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
    expect(prepareForLayoutAnimationRender).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(Warnings.missingKeyExtractor);
  });
  it("disables initial scroll correction on recyclerlistview if initialScrollIndex is in first row", () => {
    let flashList = mountFlashList({ initialScrollIndex: 0, numColumns: 3 });
    expect(
      flashList.instance.getUpdatedWindowCorrectionConfig().applyToInitialOffset
    ).toBe(false);

    flashList = mountFlashList({ initialScrollIndex: 3, numColumns: 3 });
    expect(
      flashList.instance.getUpdatedWindowCorrectionConfig().applyToInitialOffset
    ).toBe(true);

    flashList = mountFlashList({ initialScrollIndex: 2, numColumns: 3 });
    expect(
      flashList.instance.getUpdatedWindowCorrectionConfig().applyToInitialOffset
    ).toBe(false);
  });
  it("assigns distance from window to window correction object", () => {
    const flashList = mountFlashList({ estimatedFirstItemOffset: 100 });
    expect(
      flashList.instance.getUpdatedWindowCorrectionConfig().value.windowShift
    ).toBe(-100);
  });
  it("calls render item only when data of the items has changed", (done) => {
    const renderItemMock = jest.fn(({ item }) => {
      return <Text>{item}</Text>;
    });
    const flashList = mountFlashList({
      renderItem: renderItemMock,
      data: ["One", "Two", "Three", "Four"],
    });

    // because we have 4 data items
    expect(renderItemMock).toHaveBeenCalledTimes(4);
    // reset counter
    renderItemMock.mockReset();
    // changes layout of all four items
    flashList.setProps({ numColumns: 2 });
    // render item should be called 0 times because only layout of items would have changed
    expect(renderItemMock).toHaveBeenCalledTimes(0);

    // There's some async operation happening inside the scroll component causing jest to throw errors
    // This is a workaround to silence it.
    requestAnimationFrame(() => {
      done();
    });
  });
});
