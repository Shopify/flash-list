import React, { useEffect } from "react";
import { Animated, ScrollView, Text, View } from "react-native";
import "@quilted/react-testing/matchers";
import { ProgressiveListView } from "recyclerlistview";

import Warnings from "../errors/Warnings";
import AutoLayoutView from "../native/auto-layout/AutoLayoutView";
import CellContainer from "../native/cell-container/CellContainer";
import { ListRenderItemInfo, RenderTargetOptions } from "../FlashListProps";

import { mountFlashList } from "./helpers/mountFlashList";

jest.mock("../native/cell-container/CellContainer", () => {
  return jest.requireActual("../native/cell-container/CellContainer.ios.ts")
    .default;
});

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
  it("loads header and footer in empty state", () => {
    const HeaderComponent = () => {
      return <Text>Empty</Text>;
    };
    const FooterComponent = () => {
      return <Text>Empty</Text>;
    };
    const flashList = mountFlashList({
      data: [],
      ListHeaderComponent: HeaderComponent,
      ListFooterComponent: FooterComponent,
    });
    expect(flashList).toContainReactComponent(HeaderComponent);
    expect(flashList).toContainReactComponent(FooterComponent);
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

  it("should not overlap header with sitcky index 0", () => {
    const HeaderComponent = () => {
      return <Text>Empty</Text>;
    };
    const flashList = mountFlashList({
      ListHeaderComponent: HeaderComponent,
      stickyHeaderIndices: [0],
    });
    // If sticky renders there'll be 6
    expect(flashList.findAll(Text).length).toBe(5);
  });
  it("rerenders all items when layout manager changes", () => {
    let countMounts = 0;
    let currentId = 0;

    // Effect will be triggered once per mount
    const RenderComponent = ({ id }: { id?: number }) => {
      useEffect(() => {
        countMounts++;
      }, [id]);
      return <Text>Test</Text>;
    };
    const renderItem = () => {
      return <RenderComponent id={currentId} />;
    };
    const flashList = mountFlashList({
      data: new Array(100).fill("1"),
      estimatedItemSize: 70,
      renderItem,
    });

    const scrollTo = (y: number) => {
      flashList.find(ScrollView)?.trigger("onScroll", {
        nativeEvent: { contentOffset: { x: 0, y } },
      });
    };

    // Mocking some scrolls
    scrollTo(200);
    scrollTo(400);
    scrollTo(600);
    scrollTo(3000);
    scrollTo(2000);

    // changing id will trigger effects if components rerender
    currentId = 1;

    // capturing current component count to check later
    const currentComponentCount = countMounts;

    // resetting count
    countMounts = 0;

    // items widths before layout manager change should be 400
    flashList.findAll(CellContainer).forEach((cell) => {
      if (cell.props.index !== -1) {
        expect(cell.instance.props.style.width).toBe(400);
      }
    });

    // This will cause a layout manager change
    flashList.find(ScrollView)?.trigger("onLayout", {
      nativeEvent: { layout: { height: 400, width: 900 } },
    });

    // If counts match, then all components were updated
    expect(countMounts).toBe(currentComponentCount);

    // items widths after layout manager change should be 900
    flashList.findAll(CellContainer).forEach((cell) => {
      if (cell.props.index !== -1) {
        expect(cell.instance.props.style.width).toBe(900);
      }
    });

    flashList.unmount();
  });
  it("sends a warning when estimatedItemSize is not set", () => {
    const warn = jest.spyOn(console, "warn").mockReturnValue();

    const flashList = mountFlashList({
      disableDefaultEstimatedItemSize: true,
      renderItem: ({ item }) => <Text style={{ height: 200 }}>{item}</Text>,
    });
    const layoutData = flashList.instance.state.layoutProvider
      .getLayoutManager()!
      .getLayouts();
    layoutData[0].height = 100;
    layoutData[1].height = 200;
    layoutData[2].height = 300;
    flashList.find(ProgressiveListView)?.instance.onItemLayout(0);
    expect(flashList.instance.state.layoutProvider.averageItemSize).toBe(100);
    flashList.find(ProgressiveListView)?.instance.onItemLayout(1);
    flashList.find(ProgressiveListView)?.instance.onItemLayout(2);
    jest.advanceTimersByTime(1000);
    const averageItemSize =
      flashList.instance.state.layoutProvider.averageItemSize;
    expect(warn).toHaveBeenCalledWith(
      Warnings.estimatedItemSizeMissingWarning.replace(
        "@size",
        averageItemSize.toString()
      )
    );
    expect(flashList.instance.state.layoutProvider.averageItemSize).toBe(175);
    flashList.unmount();
  });
  it("clears size warning timeout on unmount", () => {
    const warn = jest.spyOn(console, "warn").mockReturnValue();

    const flashList = mountFlashList({
      disableDefaultEstimatedItemSize: true,
    });
    flashList.find(ProgressiveListView)?.instance.onItemLayout(0);
    flashList.unmount();
    jest.advanceTimersByTime(1000);
    expect(warn).toBeCalledTimes(0);
  });
  it("measure size of horizontal list when appropriate", () => {
    let flashList = mountFlashList({
      data: new Array(1).fill("1"),
      horizontal: true,
    });
    const forceUpdate = jest.spyOn(flashList.instance, "forceUpdate");
    // should contain 1 actual text and 1 dummy on mount
    expect(flashList.findAll(Text).length).toBe(2);

    // Trigger onLoad
    flashList.instance["onItemLayout"](0);
    jest.advanceTimersByTime(600);

    expect(forceUpdate).toBeCalledTimes(1);

    // TODO: Investigate why forceUpdate isn't working in tests, forcing an update
    flashList.setProps({ overrideItemLayout: () => {} });

    // After update the dummy should get removed
    expect(flashList.findAll(Text).length).toBe(1);

    flashList.unmount();

    flashList = mountFlashList({
      data: new Array(1).fill("1"),
      horizontal: true,
      disableHorizontalListHeightMeasurement: true,
    });
    // should contain 1 actual text as measurement is disabled
    expect(flashList.findAll(Text).length).toBe(1);
    flashList.unmount();
  });
  it("cancels post load setTimeout on unmount", () => {
    const flashList = mountFlashList({
      data: new Array(1).fill("1"),
      horizontal: true,
    });
    const forceUpdate = jest.spyOn(flashList.instance, "forceUpdate");
    flashList.instance["onItemLayout"](0);
    flashList.unmount();
    jest.advanceTimersByTime(600);
    expect(forceUpdate).toBeCalledTimes(0);
  });
  it("uses 250 as draw distance on Android/iOS", () => {
    const flashList = mountFlashList();
    flashList.find(ProgressiveListView)?.instance.onItemLayout(0);
    jest.advanceTimersByTime(1000);
    expect(
      flashList
        .find(ProgressiveListView)
        ?.instance.getCurrentRenderAheadOffset()
    ).toBe(250);
    flashList.unmount();
  });
  it("forwards correct renderTarget", () => {
    const renderItem = ({ target }: ListRenderItemInfo<string>) => {
      return <Text>{target}</Text>;
    };
    const flashList = mountFlashList({
      data: ["0"],
      stickyHeaderIndices: [0],
      renderItem,
    });
    expect(flashList.find(Animated.View)?.find(Text)?.props.children).toBe(
      RenderTargetOptions.StickyHeader
    );
    expect(flashList.find(View)?.find(Text)?.props.children).toBe(
      RenderTargetOptions.Cell
    );
    const flashListHorizontal = mountFlashList({
      renderItem,
      horizontal: true,
    });
    expect(
      flashListHorizontal
        .findAllWhere((node: any) => node?.props?.style?.opacity === 0)[0]
        .find(Text)?.props.children
    ).toBe("Measurement");
  });
  it("force updates items only when renderItem change", () => {
    const renderItem = jest.fn(() => <Text>Test</Text>);
    const flashList = mountFlashList({
      data: new Array(1).fill("1"),
      renderItem,
    });
    flashList.setProps({ data: new Array(1).fill("1") });
    expect(renderItem).toBeCalledTimes(1);
    const newRenderItem = jest.fn(() => <Text>Test</Text>);
    flashList.setProps({
      data: new Array(1).fill("1"),
      renderItem: newRenderItem,
    });
    expect(newRenderItem).toBeCalledTimes(1);
  });
  it("forwards disableAutoLayout prop correctly", () => {
    const flashList = mountFlashList();
    expect(flashList.find(AutoLayoutView)?.props.disableAutoLayout).toBe(
      undefined
    );
    flashList.setProps({ disableAutoLayout: true });
    expect(flashList.find(AutoLayoutView)?.props.disableAutoLayout).toBe(true);
  });
  it("computes correct scrollTo offset when view position is specified", () => {
    const flashList = mountFlashList({
      data: new Array(40).fill(1).map((_, index) => {
        return index.toString();
      }),
    });
    const plv = flashList.find(ProgressiveListView)
      ?.instance as ProgressiveListView;
    const scrollToOffset = jest.spyOn(plv, "scrollToOffset");
    flashList.instance.scrollToIndex({ index: 10, viewPosition: 0.5 });

    // Each item is 200px in height and to position it in the middle of the window (900 x 400), its offset needs to be
    // reduced by 350px. That gives us 1650. Other test cases follow the same logic.
    expect(scrollToOffset).toBeCalledWith(1650, 1650, false, true);
    flashList.instance.scrollToItem({
      item: "10",
      viewPosition: 0.5,
    });
    expect(scrollToOffset).toBeCalledWith(1650, 1650, false, true);
    flashList.setProps({ horizontal: true });
    flashList.instance.scrollToItem({
      item: "10",
      viewPosition: 0.5,
    });
    expect(scrollToOffset).toBeCalledWith(1900, 1900, false, true);
    flashList.unmount();
  });
  it("computes correct scrollTo offset when view offset is specified", () => {
    const flashList = mountFlashList({
      data: new Array(40).fill(1).map((_, index) => {
        return index.toString();
      }),
    });
    const plv = flashList.find(ProgressiveListView)
      ?.instance as ProgressiveListView;
    const scrollToOffset = jest.spyOn(plv, "scrollToOffset");

    // Each item is 200px in height and to position it in the middle of the window (900 x 400), it's offset needs to be
    // reduced by 350px + 100px offset. That gives us 1550. Other test cases follow the same logic.
    flashList.instance.scrollToIndex({
      index: 10,
      viewPosition: 0.5,
      viewOffset: 100,
    });
    expect(scrollToOffset).toBeCalledWith(1550, 1550, false, true);
    flashList.setProps({ horizontal: true });
    flashList.instance.scrollToItem({
      item: "10",
      viewPosition: 0.5,
      viewOffset: 100,
    });
    expect(scrollToOffset).toBeCalledWith(1800, 1800, false, true);
    flashList.unmount();
  });
  it("applies horizontal content container padding for vertical list", () => {
    const flashList = mountFlashList({
      numColumns: 4,
      contentContainerStyle: { paddingHorizontal: 10 },
    });
    let hasLayoutItems = false;
    flashList.instance.state.layoutProvider
      .getLayoutManager()!
      .getLayouts()
      .forEach((layout) => {
        hasLayoutItems = true;
        expect(layout.width).toBe(95);
      });
    expect(hasLayoutItems).toBe(true);
    flashList.unmount();
  });
  it("applies vertical content container padding for horizontal list", () => {
    const flashList = mountFlashList({
      horizontal: true,
      contentContainerStyle: { paddingVertical: 10 },
    });
    let hasLayoutItems = false;
    flashList.instance.state.layoutProvider
      .getLayoutManager()!
      .getLayouts()
      .forEach((layout) => {
        hasLayoutItems = true;
        expect(layout.height).toBe(880);
      });
    expect(hasLayoutItems).toBe(true);
    flashList.unmount();
  });
});
