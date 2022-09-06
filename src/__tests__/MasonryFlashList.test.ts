import { ScrollView, Text } from "react-native";
import "@quilted/react-testing/matchers";
import { ProgressiveListView } from "recyclerlistview";
import React from "react";

import { MasonryFlashListRef } from "../MasonryFlashList";

import { mountMasonryFlashList } from "./helpers/mountMasonryFlashList";

describe("MasonryFlashList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  it("renders items", () => {
    const masonryFlashList = mountMasonryFlashList();
    expect(masonryFlashList.findAll(ProgressiveListView).length).toBe(3);
    expect(masonryFlashList).toContainReactComponent(Text, { children: "One" });
    expect(masonryFlashList).toContainReactComponent(ProgressiveListView, {
      isHorizontal: false,
    });
  });
  it("raised onLoad event when first internal child mounts", () => {
    const onLoadMock = jest.fn();
    const masonryFlashList = mountMasonryFlashList({
      onLoad: onLoadMock,
    });
    expect(onLoadMock).not.toHaveBeenCalled();
    masonryFlashList.findAll(ProgressiveListView)[1]?.instance.onItemLayout(0);
    expect(onLoadMock).toHaveBeenCalledTimes(1);
  });
  it("can resize columns using getColumnSizeMultiplier", () => {
    const masonryFlashList = mountMasonryFlashList({
      getColumnSizeMultiplier: (_, column) => (column === 0 ? 0.5 : 1.5),
    });
    const progressiveListView =
      masonryFlashList.find(ProgressiveListView)!.instance;
    expect(progressiveListView.getLayout(0).width).toBe(100);
    expect(progressiveListView.getLayout(1).width).toBe(300);

    expect(masonryFlashList.findAll(ProgressiveListView).length).toBe(3);
    masonryFlashList.findAll(ProgressiveListView).forEach((plv, index) => {
      if (index === 1) {
        expect(plv.instance.props.layoutSize.width).toBe(100);
      }
      if (index === 2) {
        expect(plv.instance.props.layoutSize.width).toBe(300);
      }
    });
  });
  it("mounts a single ScrollView", () => {
    const masonryFlashList = mountMasonryFlashList();
    expect(masonryFlashList.findAll(ScrollView)).toHaveLength(1);
  });
  it("forwards single onScroll event to external listener", () => {
    const onScrollMock = jest.fn();
    const masonryFlashList = mountMasonryFlashList({
      onScroll: onScrollMock,
    });
    masonryFlashList.find(ScrollView)?.instance.props.onScroll({
      nativeEvent: { contentOffset: { x: 0, y: 0 } },
    });
    expect(onScrollMock).toHaveBeenCalledTimes(1);
  });
  it("updates scroll offset of all internal lists", () => {
    const onScrollMock = jest.fn();
    const masonryFlashList = mountMasonryFlashList({
      onScroll: onScrollMock,
    });
    masonryFlashList.find(ScrollView)?.instance.props.onScroll({
      nativeEvent: { contentOffset: { x: 0, y: 100 } },
    });
    masonryFlashList.findAll(ProgressiveListView).forEach((list) => {
      expect(list.instance.getCurrentScrollOffset()).toBe(100);
    });
  });
  it("has a valid ref object", () => {
    const ref = React.createRef<MasonryFlashListRef<string>>();
    mountMasonryFlashList({}, ref);
    expect(ref.current).toBeDefined();
  });
  it("forwards overrideItemLayout to internal lists", () => {
    const overrideItemLayout = jest.fn((layout) => {
      layout.size = 300;
    });
    const masonryFlashList = mountMasonryFlashList({
      overrideItemLayout,
    });
    expect(masonryFlashList.findAll(ProgressiveListView).length).toBe(3);
    masonryFlashList.findAll(ProgressiveListView).forEach((list, index) => {
      if (index !== 0) {
        expect(list.instance.getLayout(0).height).toBe(300);
      }
    });
  });
  it("forwards keyExtractor to internal list", () => {
    const keyExtractor = (_: string, index: number) => (index + 1).toString();
    const masonryFlashList = mountMasonryFlashList({
      keyExtractor,
    });
    expect(masonryFlashList.findAll(ProgressiveListView).length).toBe(3);
    expect(
      masonryFlashList
        .findAll(ProgressiveListView)[0]
        .instance.props.dataProvider.getStableId(0)
    ).toBe("0");
    expect(
      masonryFlashList
        .findAll(ProgressiveListView)[1]
        .instance.props.dataProvider.getStableId(0)
    ).toBe("1");
    expect(
      masonryFlashList
        .findAll(ProgressiveListView)[2]
        .instance.props.dataProvider.getStableId(0)
    ).toBe("2");
  });
});
