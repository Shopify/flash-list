import { ScrollView, Text, View } from "react-native";
import "@quilted/react-testing/matchers";
import { ProgressiveListView } from "recyclerlistview";
import React from "react";

import {
  MasonryFlashListProps,
  MasonryFlashListRef,
} from "../MasonryFlashList";
import FlashList from "../FlashList";

import { mountMasonryFlashList } from "./helpers/mountMasonryFlashList";

describe("MasonryFlashList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  it("renders items and has 3 internal lists", () => {
    const masonryFlashList = mountMasonryFlashList();
    expect(masonryFlashList.findAll(ProgressiveListView).length).toBe(3);
    expect(masonryFlashList).toContainReactComponent(Text, { children: "One" });
    expect(masonryFlashList).toContainReactComponent(ProgressiveListView, {
      isHorizontal: false,
    });
    masonryFlashList.unmount();
  });
  it("invokes renderItem with columnIndex and columnSpan", () => {
    const mockRenderItem = jest.fn(() => null);
    const masonryFlashList = mountMasonryFlashList({
      renderItem: mockRenderItem,
      data: ["One", "Two", "Three"],
      numColumns: 3,
    });
    expect(mockRenderItem).toHaveBeenCalledWith(
      expect.objectContaining({
        columnIndex: 0,
        columnSpan: 1,
      })
    );

    expect(mockRenderItem).toHaveBeenCalledWith(
      expect.objectContaining({
        columnIndex: 1,
        columnSpan: 1,
      })
    );

    expect(mockRenderItem).toHaveBeenCalledWith(
      expect.objectContaining({
        columnSpan: 1,
        columnIndex: 2,
      })
    );
    masonryFlashList.unmount();
  });
  it("raised onLoad event only when first internal child mounts", () => {
    const onLoadMock = jest.fn();
    const ref = React.createRef<MasonryFlashListRef<string>>();
    const masonryFlashList = mountMasonryFlashList(
      {
        onLoad: onLoadMock,
      },
      ref
    );
    expect(onLoadMock).not.toHaveBeenCalled();
    masonryFlashList.findAll(ProgressiveListView)[1]?.instance.onItemLayout(0);
    expect(onLoadMock).toHaveBeenCalledTimes(1);

    // on load shouldn't be passed to wrapper list
    expect((ref.current as FlashList<string>).props.onLoad).toBeUndefined();
    masonryFlashList.unmount();
  });
  it("can resize columns using getColumnFlex", () => {
    const masonryFlashList = mountMasonryFlashList({
      getColumnFlex: (_, column) => (column === 0 ? 1 : 3),
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
    masonryFlashList.unmount();
  });
  it("mounts a single ScrollView", () => {
    const masonryFlashList = mountMasonryFlashList();
    expect(masonryFlashList.findAll(ScrollView)).toHaveLength(1);
    masonryFlashList.unmount();
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
    masonryFlashList.unmount();
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
    masonryFlashList.unmount();
  });
  it("has a valid ref object", () => {
    const ref = React.createRef<MasonryFlashListRef<string>>();
    const masonryFlashList = mountMasonryFlashList({}, ref);
    expect(ref.current).toBeDefined();
    masonryFlashList.unmount();
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
    masonryFlashList.unmount();
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
    masonryFlashList.unmount();
  });
  it("correctly maps list indices to actual indices", () => {
    const data = new Array(20).fill(0).map((_, index) => index.toString());
    const getItemType = (item: string, index: number) => {
      expect(index.toString()).toBe(item);
      return 0;
    };
    const renderItem: MasonryFlashListProps<string>["renderItem"] = ({
      item,
      index,
    }) => {
      expect(index.toString()).toBe(item);
      return null;
    };
    const overrideItemLayout: MasonryFlashListProps<string>["overrideItemLayout"] =
      (layout, item: string, index: number) => {
        expect(index.toString()).toBe(item);
      };
    const keyExtractor = (item: string, index: number) => {
      expect(index.toString()).toBe(item);
      return index.toString();
    };
    const onViewableItemsChanged: MasonryFlashListProps<string>["onViewableItemsChanged"] =
      (info) => {
        info.viewableItems.forEach((viewToken) => {
          expect(viewToken.index?.toString()).toBe(viewToken.item);
        });
      };

    const masonryFlashList = mountMasonryFlashList({
      data,
      renderItem,
      getItemType,
      overrideItemLayout,
      keyExtractor,
      onViewableItemsChanged,
    });
    jest.advanceTimersByTime(1000);
    masonryFlashList.unmount();
  });
  it("internal list height should be derived from the parent and width from itself", () => {
    const masonryFlashList = mountMasonryFlashList({
      testID: "MasonryProxyScrollView",
    });
    expect(masonryFlashList.findAll(ProgressiveListView).length).toBe(3);
    masonryFlashList.findAll(View).forEach((view: any) => {
      view.props?.onLayout?.({
        nativeEvent: { layout: { width: 500, height: 500 } },
      });
    });
    masonryFlashList.findAll(ProgressiveListView).forEach((list, index) => {
      if (index !== 0) {
        expect(list.instance.getRenderedSize().width).toBe(500);
        expect(list.instance.getRenderedSize().height).toBe(900);
      }
    });
    masonryFlashList.unmount();
  });
  it("can optimize item arrangement", () => {
    const columnCount = 3;
    const data = new Array(999).fill(null).map((_, index) => {
      return "1";
    });
    const masonryFlashList = mountMasonryFlashList({
      data,
      optimizeItemArrangement: true,
      numColumns: columnCount,
      overrideItemLayout(layout, _, index, __, ___?) {
        layout.size = ((index * 10) % 100) + 100 / ((index % columnCount) + 1);
      },
    });
    expect(masonryFlashList.findAll(ProgressiveListView).length).toBe(4);

    // I've verified that the following values are correct by observing the algorithm in action
    // Captured values will help prevent regression in the future
    expect(
      Math.floor(
        masonryFlashList
          .findAll(ProgressiveListView)[1]
          .instance.getContentDimension().height
      )
    ).toBe(35306);
    expect(
      Math.floor(
        masonryFlashList
          .findAll(ProgressiveListView)[2]
          .instance.getContentDimension().height
      )
    ).toBe(35313);
    expect(
      Math.floor(
        masonryFlashList
          .findAll(ProgressiveListView)[3]
          .instance.getContentDimension().height
      )
    ).toBe(35339);
  });
  it("applies horizontal content container padding to the list", () => {
    const masonryFlashList = mountMasonryFlashList({
      numColumns: 4,
      contentContainerStyle: { paddingHorizontal: 10 },
    });
    expect(masonryFlashList.findAll(ProgressiveListView).length).toBe(5);
    masonryFlashList.findAll(ProgressiveListView).forEach((list, index) => {
      if (index === 0) {
        expect(list.instance.getRenderedSize().width).toBe(400);
        expect(list.instance.getRenderedSize().height).toBe(900);
      } else {
        expect(list.instance.getRenderedSize().width).toBe(95);
        expect(list.instance.getRenderedSize().height).toBe(900);
      }
    });
    masonryFlashList.unmount();
  });
  it("divides columns equally if no getColumnFlex is passed", () => {
    const masonryFlashList = mountMasonryFlashList({
      numColumns: 4,
    });
    const progressiveListView =
      masonryFlashList.find(ProgressiveListView)!.instance;
    expect(progressiveListView.getLayout(0).width).toBe(100);
    expect(progressiveListView.getLayout(1).width).toBe(100);
    expect(progressiveListView.getLayout(2).width).toBe(100);
    expect(progressiveListView.getLayout(3).width).toBe(100);
  });
});
