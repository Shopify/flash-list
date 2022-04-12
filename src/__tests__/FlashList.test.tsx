import React, { useEffect } from "react";
import { Text } from "react-native";
import "@quilted/react-testing/matchers";
import { ProgressiveListView } from "recyclerlistview";

import Warnings from "../errors/Warnings";
import AutoLayoutView from "../AutoLayoutView";

import { mountFlashList } from "./helpers/mountFlashList";

describe("FlashList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
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
    const warn = jest.spyOn(console, "warn").mockReturnValue();
    const prepareForLayoutAnimationRender = jest.spyOn(
      flashList.instance!.recyclerlistview_unsafe!,
      "prepareForLayoutAnimationRender"
    );
    flashList.instance.prepareForLayoutAnimationRender();
    expect(prepareForLayoutAnimationRender).toHaveBeenCalledTimes(1);
    expect(warn).not.toHaveBeenCalled();
  });

  it("sends a warning when prepareForLayoutAnimationRender without keyExtractor", () => {
    const flashList = mountFlashList();
    const warn = jest.spyOn(console, "warn").mockReturnValue();
    const prepareForLayoutAnimationRender = jest.spyOn(
      flashList.instance!.recyclerlistview_unsafe!,
      "prepareForLayoutAnimationRender"
    );
    flashList.instance.prepareForLayoutAnimationRender();
    expect(prepareForLayoutAnimationRender).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(Warnings.missingKeyExtractor);
  });

  it("disables initial scroll correction on recyclerlistview if initialScrollIndex is in first row", () => {
    let flashList = mountFlashList({ initialScrollIndex: 0, numColumns: 3 });
    expect(
      flashList.instance["getUpdatedWindowCorrectionConfig"]()
        .applyToInitialOffset
    ).toBe(false);

    flashList = mountFlashList({ initialScrollIndex: 3, numColumns: 3 });
    expect(
      flashList.instance["getUpdatedWindowCorrectionConfig"]()
        .applyToInitialOffset
    ).toBe(true);

    flashList = mountFlashList({ initialScrollIndex: 2, numColumns: 3 });
    expect(
      flashList.instance["getUpdatedWindowCorrectionConfig"]()
        .applyToInitialOffset
    ).toBe(false);
  });

  it("assigns distance from window to window correction object", () => {
    const flashList = mountFlashList({ estimatedFirstItemOffset: 100 });
    expect(
      flashList.instance["getUpdatedWindowCorrectionConfig"]().value.windowShift
    ).toBe(-100);
  });

  it("only forwards onBlankArea prop to AutoLayout when needed", () => {
    const flashList = mountFlashList();
    const autoLayoutView = flashList.find(AutoLayoutView)?.instance;
    expect(autoLayoutView.props.onBlankAreaEvent).toBeUndefined();
    flashList.setProps({ onBlankArea: () => {} });
    expect(autoLayoutView.props.onBlankAreaEvent).not.toBeUndefined();
  });

  it("calls render item only when data of the items has changed", () => {
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
    renderItemMock.mockClear();
    // changes layout of all four items
    flashList.setProps({ numColumns: 2 });
    // render item should be called 0 times because only layout of items would have changed
    expect(renderItemMock).toHaveBeenCalledTimes(0);
    flashList.unmount();
  });

  it("keeps component mounted based on prepareForLayoutAnimationRender being called", () => {
    // Tracks components being unmounted
    const unmountMock = jest.fn();
    const Item = ({ text }: { text: string }) => {
      useEffect(() => {
        return unmountMock;
      }, []);
      return <Text>{text}</Text>;
    };

    const flashList = mountFlashList({
      keyExtractor: (item) => item,
      renderItem: ({ item }) => {
        return <Item text={item} />;
      },
      data: ["One", "Two", "Three", "Four"],
    });

    // Change data without prepareForLayoutAnimationRender
    flashList.setProps({ data: ["One", "Two", "Three", "Five"] });
    expect(unmountMock).not.toHaveBeenCalled();

    // Before changing data, we run prepareForLayoutAnimationRender.
    // This ensures component gets unmounted instead of being recycled to ensure layout animations run as expected.
    flashList.instance.prepareForLayoutAnimationRender();
    flashList.setProps({ data: ["One", "Two", "Three", "Six"] });
    expect(unmountMock).toHaveBeenCalledTimes(1);
  });

  it("fires onLoad event", () => {
    const onLoadMock = jest.fn();

    // empty list
    mountFlashList({ data: [], onLoad: onLoadMock });
    expect(onLoadMock).toHaveBeenCalledWith({
      elapsedTimeInMs: expect.any(Number),
    });

    onLoadMock.mockClear();

    // non-empty list
    const flashList = mountFlashList({ onLoad: onLoadMock });
    flashList.find(ProgressiveListView)?.instance.onItemLayout(0);
    expect(onLoadMock).toHaveBeenCalledWith({
      elapsedTimeInMs: expect.any(Number),
    });
  });

  it("loads an empty state", () => {
    const EmptyComponent = () => {
      return <Text>Empty</Text>;
    };
    const flashList = mountFlashList({
      data: [],
      ListEmptyComponent: EmptyComponent,
    });
    expect(flashList).toContainReactComponent(EmptyComponent);
  });

  it("reports layout changes to the layout provider", () => {
    const flashList = mountFlashList();
    const reportItemLayoutMock = jest.spyOn(
      flashList.instance.state.layoutProvider,
      "reportItemLayout"
    );
    flashList.find(ProgressiveListView)?.instance.onItemLayout(0);
    expect(reportItemLayoutMock).toHaveBeenCalledWith(0);
    flashList.unmount();
  });

  it("should prefer overrideItemLayout over estimate and average", () => {
    const flashList = mountFlashList({
      overrideItemLayout: (layout) => {
        layout.size = 50;
      },
    });
    expect(flashList.instance.state.layoutProvider.averageItemSize).toBe(200);
    expect(
      flashList.instance.state
        .layoutProvider!.getLayoutManager()!
        .getLayouts()[0].height
    ).toBe(50);
  });

  it("should override span with overrideItemLayout", () => {
    const renderItemMock = jest.fn(({ item }) => {
      return <Text>{item}</Text>;
    });
    mountFlashList({
      overrideItemLayout: (layout) => {
        layout.span = 2;
      },
      numColumns: 2,
      estimatedItemSize: 300,
      renderItem: renderItemMock,
    });
    expect(renderItemMock).toHaveBeenCalledTimes(3);

    renderItemMock.mockClear();
    mountFlashList({
      overrideItemLayout: (layout, _, index) => {
        if (index > 2) {
          layout.span = 2;
        }
      },
      data: new Array(20).fill(""),
      numColumns: 3,
      estimatedItemSize: 100,
      renderItem: renderItemMock,
    });

    expect(renderItemMock).toHaveBeenCalledTimes(11);
  });

  it("overrideItemLayout should consider 0 as a valid span", () => {
    const renderItemMock = jest.fn(({ item }) => {
      return <Text>{item}</Text>;
    });
    mountFlashList({
      overrideItemLayout: (layout, _, index) => {
        if (index < 4) {
          layout.span = 0;
        }
      },
      data: new Array(20).fill(""),
      numColumns: 2,
      renderItem: renderItemMock,
    });
    expect(renderItemMock).toHaveBeenCalledTimes(14);
  });

  it("reports onViewableItemsChanged for viewable items", () => {
    const onViewableItemsChanged = jest.fn();
    const onViewableItemsChangedForItemVisiblePercentThreshold = jest.fn();
    const flashList = mountFlashList({
      estimatedItemSize: 300,
      viewabilityConfig: {
        minimumViewTime: 250,
      },
      viewabilityConfigCallbackPairs: [
        {
          onViewableItemsChanged:
            onViewableItemsChangedForItemVisiblePercentThreshold,
          viewabilityConfig: {
            itemVisiblePercentThreshold: 50,
            waitForInteraction: true,
          },
        },
      ],
      onViewableItemsChanged,
    });

    // onViewableItemsChanged is not called before 250 ms have elapsed
    expect(onViewableItemsChanged).not.toHaveBeenCalled();

    jest.advanceTimersByTime(250);
    // Initial viewable items
    expect(onViewableItemsChanged).toHaveBeenCalledWith({
      changed: [
        {
          index: 0,
          isViewable: true,
          item: "One",
          key: "0",
          timestamp: expect.any(Number),
        },
        {
          index: 1,
          isViewable: true,
          item: "Two",
          key: "1",
          timestamp: expect.any(Number),
        },
        {
          index: 2,
          isViewable: true,
          item: "Three",
          key: "2",
          timestamp: expect.any(Number),
        },
      ],
      viewableItems: [
        {
          index: 0,
          isViewable: true,
          item: "One",
          key: "0",
          timestamp: expect.any(Number),
        },
        {
          index: 1,
          isViewable: true,
          item: "Two",
          key: "1",
          timestamp: expect.any(Number),
        },
        {
          index: 2,
          isViewable: true,
          item: "Three",
          key: "2",
          timestamp: expect.any(Number),
        },
      ],
    });
    expect(
      onViewableItemsChangedForItemVisiblePercentThreshold
    ).not.toHaveBeenCalled();

    // onViewableItemsChangedForItemVisiblePercentThreshold waits for interaction before reporting viewable items
    flashList.instance.recordInteraction();
    jest.advanceTimersByTime(250);
    expect(
      onViewableItemsChangedForItemVisiblePercentThreshold
    ).toHaveBeenCalledWith({
      changed: [
        {
          index: 0,
          isViewable: true,
          item: "One",
          key: "0",
          timestamp: expect.any(Number),
        },
        {
          index: 1,
          isViewable: true,
          item: "Two",
          key: "1",
          timestamp: expect.any(Number),
        },
        {
          index: 2,
          isViewable: true,
          item: "Three",
          key: "2",
          timestamp: expect.any(Number),
        },
      ],
      viewableItems: [
        {
          index: 0,
          isViewable: true,
          item: "One",
          key: "0",
          timestamp: expect.any(Number),
        },
        {
          index: 1,
          isViewable: true,
          item: "Two",
          key: "1",
          timestamp: expect.any(Number),
        },
        {
          index: 2,
          isViewable: true,
          item: "Three",
          key: "2",
          timestamp: expect.any(Number),
        },
      ],
    });

    onViewableItemsChanged.mockReset();
    onViewableItemsChangedForItemVisiblePercentThreshold.mockReset();
    // Mocking a scroll that will make the first item not visible and the last item visible
    jest
      .spyOn(
        flashList.instance!.recyclerlistview_unsafe!,
        "getCurrentScrollOffset"
      )
      .mockReturnValue(200);
    flashList.instance!.recyclerlistview_unsafe!.props.onVisibleIndicesChanged?.(
      [0, 1, 2, 3],
      [],
      []
    );
    flashList.instance!.recyclerlistview_unsafe!.props.onScroll?.(
      { nativeEvent: { contentOffset: { x: 0, y: 200 } } },
      0,
      200
    );
    jest.advanceTimersByTime(250);
    expect(onViewableItemsChanged).toHaveBeenCalledWith({
      changed: [
        {
          index: 3,
          isViewable: true,
          item: "Four",
          key: "3",
          timestamp: expect.any(Number),
        },
      ],
      viewableItems: [
        {
          index: 0,
          isViewable: true,
          item: "One",
          key: "0",
          timestamp: expect.any(Number),
        },
        {
          index: 1,
          isViewable: true,
          item: "Two",
          key: "1",
          timestamp: expect.any(Number),
        },
        {
          index: 2,
          isViewable: true,
          item: "Three",
          key: "2",
          timestamp: expect.any(Number),
        },
        {
          index: 3,
          isViewable: true,
          item: "Four",
          key: "3",
          timestamp: expect.any(Number),
        },
      ],
    });
    expect(
      onViewableItemsChangedForItemVisiblePercentThreshold
    ).toHaveBeenCalledWith({
      changed: [
        {
          index: 3,
          isViewable: true,
          item: "Four",
          key: "3",
          timestamp: expect.any(Number),
        },
        {
          index: 0,
          isViewable: false,
          item: "One",
          key: "0",
          timestamp: expect.any(Number),
        },
      ],
      viewableItems: [
        {
          index: 1,
          isViewable: true,
          item: "Two",
          key: "1",
          timestamp: expect.any(Number),
        },
        {
          index: 2,
          isViewable: true,
          item: "Three",
          key: "2",
          timestamp: expect.any(Number),
        },
        {
          index: 3,
          isViewable: true,
          item: "Four",
          key: "3",
          timestamp: expect.any(Number),
        },
      ],
    });
  });

  it("viewability reports take into account estimatedFirstItemOffset", () => {
    const onViewableItemsChanged = jest.fn();
    mountFlashList({
      estimatedFirstItemOffset: 200,
      estimatedItemSize: 300,
      onViewableItemsChanged,
      viewabilityConfig: { itemVisiblePercentThreshold: 50 },
    });

    // onViewableItemsChanged is not called before 250 ms have elapsed
    expect(onViewableItemsChanged).not.toHaveBeenCalled();

    jest.advanceTimersByTime(250);
    // Initial viewable items
    expect(onViewableItemsChanged).toHaveBeenCalledWith({
      changed: [
        {
          index: 0,
          isViewable: true,
          item: "One",
          key: "0",
          timestamp: expect.any(Number),
        },
        {
          index: 1,
          isViewable: true,
          item: "Two",
          key: "1",
          timestamp: expect.any(Number),
        },
      ],
      viewableItems: [
        {
          index: 0,
          isViewable: true,
          item: "One",
          key: "0",
          timestamp: expect.any(Number),
        },
        {
          index: 1,
          isViewable: true,
          item: "Two",
          key: "1",
          timestamp: expect.any(Number),
        },
      ],
    });
  });
});
