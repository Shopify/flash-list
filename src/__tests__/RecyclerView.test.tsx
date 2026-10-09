import React, { createRef } from "react";
import { Animated, Text, View } from "react-native";
import "@quilted/react-testing/matchers";
import { render } from "@quilted/react-testing";

import { FlashListRef } from "../FlashListRef";
import { FlashList } from "..";

// Mock measureLayout to return fixed dimensions
jest.mock("../recyclerview/utils/measureLayout", () => {
  const originalModule = jest.requireActual(
    "../recyclerview/utils/measureLayout"
  );
  return {
    ...originalModule,
    measureParentSize: jest.fn().mockImplementation(() => ({
      width: 399,
      height: 899,
    })),
    measureFirstChildLayout: jest.fn().mockImplementation(() => ({
      x: 0,
      y: 0,
      width: 399,
      height: 899,
    })),
    measureItemLayout: jest.fn().mockImplementation(() => ({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    })),
  };
});

const renderRecyclerView = (args: {
  numColumns?: number;
  masonry?: boolean;
  horizontal?: boolean;
  ref?: React.Ref<FlashListRef<number>>;
  data?: number[];
}) => {
  const {
    numColumns = 1,
    masonry = false,
    horizontal = false,
    ref,
    data,
  } = args;
  return render(
    <FlashList
      ref={ref}
      data={
        data ?? [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        ]
      }
      masonry={masonry}
      overrideProps={{ initialDrawBatchSize: 1 }}
      drawDistance={0}
      numColumns={numColumns}
      horizontal={horizontal}
      renderItem={({ item }) => <Text>{item}</Text>}
    />
  );
};

describe("RecyclerView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });
  describe("Linear Layout", () => {
    it("renders items ", () => {
      const result = renderRecyclerView({});

      expect(result).toContainReactComponent(Text, { children: 0 });
      expect(result).not.toContainReactComponent(Text, { children: 11 });
    });
  });

  describe("Sticky header config", () => {
    it("applies configured sticky header zIndex", () => {
      const result = render(
        <FlashList
          data={[0, 1, 2]}
          renderItem={({ item }) => <Text>{item}</Text>}
          stickyHeaderIndices={[0]}
          stickyHeaderConfig={{ zIndex: 0 }}
          overrideProps={{ initialDrawBatchSize: 1 }}
          drawDistance={0}
        />
      );

      const animatedView = result.find(Animated.View);
      expect(animatedView).toHaveReactProps({
        style: expect.objectContaining({
          zIndex: 0,
        }),
      });
    });
  });

  describe("Masonry Layout", () => {
    it("renders items with masonry", () => {
      const result = renderRecyclerView({ masonry: true });

      expect(result).toContainReactComponent(Text, { children: 0 });
    });
    it("should not render item 18, 19 with numColumns 2", () => {
      const result = renderRecyclerView({ numColumns: 2, masonry: true });

      expect(result).toContainReactComponent(Text, {
        children: 17,
      });
      expect(result).not.toContainReactComponent(Text, {
        children: 18,
      });

      expect(result).not.toContainReactComponent(Text, {
        children: 19,
      });
    });
  });

  describe("Grid Layout", () => {
    it("renders items with numColumns 2", () => {
      const result = renderRecyclerView({ numColumns: 2 });

      expect(result).toContainReactComponent(Text, { children: 0 });
    });
    it("should not render item 18, 19 with numColumns 2", () => {
      const result = renderRecyclerView({ numColumns: 2 });

      expect(result).toContainReactComponent(Text, {
        children: 17,
      });
      expect(result).not.toContainReactComponent(Text, {
        children: 18,
      });

      expect(result).not.toContainReactComponent(Text, {
        children: 19,
      });
    });
  });

  describe("Horizontal Layout", () => {
    it("renders items with horizontal", () => {
      const result = renderRecyclerView({ horizontal: true });

      expect(result).toContainReactComponent(Text, { children: 0 });
      expect(result).not.toContainReactComponent(Text, { children: 4 });
    });
  });

  describe("RecyclerView ref", () => {
    it("check if ref has updated props after re-renders", () => {
      const ref = createRef<FlashListRef<number>>();
      const result = renderRecyclerView({ ref, data: [0, 1, 2] });
      result.setProps({ data: [0, 1, 2, 3] });
      expect(ref.current?.props.data).toEqual([0, 1, 2, 3]);
    });
  });

  describe("Item separators in grid mode", () => {
    const Separator = () => <View style={{ height: 10 }} />;

    it("should not render separators for items in the last row with numColumns > 1", () => {
      const result = render(
        <FlashList
          data={[0, 1, 2, 3]}
          numColumns={2}
          overrideProps={{ initialDrawBatchSize: 1 }}
          drawDistance={0}
          renderItem={({ item }) => <Text>{item}</Text>}
          ItemSeparatorComponent={Separator}
        />
      );
      // Row 1: items 0, 1 → separators (not last row)
      // Row 2: items 2, 3 → no separators (last row)
      const separators = result.findAll(Separator);
      expect(separators.length).toBe(2);
    });

    it("should render separators normally with numColumns=1", () => {
      const result = render(
        <FlashList
          data={[0, 1, 2, 3]}
          overrideProps={{ initialDrawBatchSize: 1 }}
          drawDistance={0}
          renderItem={({ item }) => <Text>{item}</Text>}
          ItemSeparatorComponent={Separator}
        />
      );
      // Items 0, 1, 2 → separators; item 3 → no separator (last item)
      const separators = result.findAll(Separator);
      expect(separators.length).toBe(3);
    });

    it("should handle incomplete last row with numColumns > 1", () => {
      const result = render(
        <FlashList
          data={[0, 1, 2, 3, 4]}
          numColumns={3}
          overrideProps={{ initialDrawBatchSize: 1 }}
          drawDistance={0}
          renderItem={({ item }) => <Text>{item}</Text>}
          ItemSeparatorComponent={Separator}
        />
      );
      // Row 1: items 0, 1, 2 → separators (not last row)
      // Row 2: items 3, 4 → no separators (last row, incomplete)
      const separators = result.findAll(Separator);
      expect(separators.length).toBe(3);
    });

    it("should not render separators when all items fit in a single row", () => {
      const result = render(
        <FlashList
          data={[0, 1]}
          numColumns={2}
          overrideProps={{ initialDrawBatchSize: 1 }}
          drawDistance={0}
          renderItem={({ item }) => <Text>{item}</Text>}
          ItemSeparatorComponent={Separator}
        />
      );
      // Single row: items 0, 1 → no separators (only row = last row)
      const separators = result.findAll(Separator);
      expect(separators.length).toBe(0);
    });
  });

  describe("Viewability with initialScrollIndex", () => {
    const scrollTo = (root: ReturnType<typeof render>, y: number) => {
      const scrollable = root.findWhere((node: any) => node.props.onScroll);
      if (!scrollable) throw new Error("Could not find scrollable component");

      const onScroll: any = scrollable.prop("onScroll" as never);
      root.act(() => {
        onScroll({
          nativeEvent: {
            contentOffset: { x: 0, y },
            contentSize: { width: 399, height: 2000 },
            layoutMeasurement: { width: 399, height: 899 },
          },
        });
      });
    };

    it("should not fire onViewableItemsChanged on mount when waitForInteraction is true and initialScrollIndex is set", () => {
      const onViewableItemsChanged = jest.fn();
      const result = render(
        <FlashList
          data={[
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
            19,
          ]}
          initialScrollIndex={5}
          viewabilityConfig={{ waitForInteraction: true }}
          onViewableItemsChanged={onViewableItemsChanged}
          overrideProps={{ initialDrawBatchSize: 1 }}
          drawDistance={0}
          renderItem={({ item }) => <Text>{item}</Text>}
        />
      );

      // Simulate scroll event from initialScrollIndex programmatic scroll
      scrollTo(result, 500);
      jest.runAllTimers();

      // Should NOT have fired despite items being visible
      expect(onViewableItemsChanged).not.toHaveBeenCalled();
    });

    it("should fire onViewableItemsChanged after real user interaction even with initialScrollIndex", () => {
      const onViewableItemsChanged = jest.fn();
      const ref = createRef<FlashListRef<number>>();
      const result = render(
        <FlashList
          ref={ref}
          data={[
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
            19,
          ]}
          initialScrollIndex={5}
          viewabilityConfig={{ waitForInteraction: true }}
          onViewableItemsChanged={onViewableItemsChanged}
          overrideProps={{ initialDrawBatchSize: 1 }}
          drawDistance={0}
          renderItem={({ item }) => <Text>{item}</Text>}
        />
      );

      // Initial scroll - no callback
      scrollTo(result, 500);
      jest.runAllTimers();
      expect(onViewableItemsChanged).not.toHaveBeenCalled();

      // Clear the initial scroll flag (simulating the 100ms timeout completing)
      jest.advanceTimersByTime(200);

      // Real user interaction via ref
      ref.current?.recordInteraction();

      // User scroll simulation
      scrollTo(result, 600);
      jest.runAllTimers();

      // NOW callback should fire
      expect(onViewableItemsChanged).toHaveBeenCalled();
    });
  });

  describe("Sticky headers with content above FlashList", () => {
    // Each item is 100px tall (from measureItemLayout mock).
    // With stickyHeaderIndices=[0, 5, 10, 15], header 5 sits at y=500.
    //
    // On Fabric, measureParentSize returns the view's position in its parent
    // instead of (0,0). The old code subtracted this from firstItemOffset,
    // making sticky headers activate prematurely.
    //
    // These tests simulate Fabric by mocking measureParentSize to return
    // non-zero y, then scroll just before header 5 and assert it hasn't
    // activated yet.
    const { measureParentSize } = jest.requireMock(
      "../recyclerview/utils/measureLayout"
    ) as { measureParentSize: jest.Mock };

    afterEach(() => {
      measureParentSize.mockImplementation(() => ({
        width: 399,
        height: 899,
      }));
    });

    const renderFlashListWithStickyHeaders = (parentViewY: number) => {
      measureParentSize.mockImplementation(() => ({
        x: 0,
        y: parentViewY,
        width: 399,
        height: 899,
      }));

      const onChangeStickyIndex = jest.fn();
      const result = render(
        <FlashList
          data={[
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
            19,
          ]}
          renderItem={({ item }) => <Text>{item}</Text>}
          stickyHeaderIndices={[0, 5, 10, 15]}
          onChangeStickyIndex={onChangeStickyIndex}
          overrideProps={{ initialDrawBatchSize: 1 }}
          drawDistance={0}
        />
      );

      return { result, onChangeStickyIndex };
    };

    const scrollTo = (root: ReturnType<typeof render>, y: number) => {
      const scrollable = root.findWhere((node: any) => node.props.onScroll);
      if (!scrollable) throw new Error("Could not find scrollable component");

      const onScroll: any = scrollable.prop("onScroll" as never);
      root.act(() => {
        onScroll({
          nativeEvent: {
            contentOffset: { x: 0, y },
            contentSize: { width: 399, height: 2000 },
            layoutMeasurement: { width: 399, height: 899 },
          },
        });
      });
    };

    it("no content above - header 5 should not activate before y=500", () => {
      const { result, onChangeStickyIndex } =
        renderFlashListWithStickyHeaders(0);
      scrollTo(result, 450);
      expect(onChangeStickyIndex).toHaveBeenLastCalledWith(0, -1);
    });

    it("50px content above - header 5 should not activate before y=500", () => {
      const { result, onChangeStickyIndex } =
        renderFlashListWithStickyHeaders(50);
      scrollTo(result, 450);
      expect(onChangeStickyIndex).toHaveBeenLastCalledWith(0, -1);
    });

    it("100px content above - header 5 should not activate before y=500", () => {
      const { result, onChangeStickyIndex } =
        renderFlashListWithStickyHeaders(100);
      scrollTo(result, 400);
      expect(onChangeStickyIndex).toHaveBeenLastCalledWith(0, -1);
    });
  });

  describe("scrollToIndex max offset includes content after the items", () => {
    // 20 items of 100px in an 899px window: items end at 2000, so the
    // layout-based max offset is 2000 - 899 = 1101.
    // Centering the last item needs 1900 - (899 - 100) * 0.5 = 1500.5.
    const data = Array.from({ length: 20 }, (_, i) => i);

    const { measureItemLayout } = jest.requireMock(
      "../recyclerview/utils/measureLayout"
    ) as { measureItemLayout: jest.Mock };

    beforeEach(() => {
      measureItemLayout.mockImplementation(() => ({
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      }));
    });

    const renderList = ({
      onContentSizeChange = jest.fn(),
      horizontal = false,
    }: { onContentSizeChange?: jest.Mock; horizontal?: boolean } = {}) => {
      const ref = createRef<FlashListRef<number>>();
      const result = render(
        <FlashList
          ref={ref}
          data={data}
          horizontal={horizontal}
          renderItem={({ item }) => <Text>{item}</Text>}
          onContentSizeChange={onContentSizeChange}
        />
      );
      const scrollToSpy = jest.fn();
      const nativeScrollRef = ref.current?.getNativeScrollRef() as any;
      expect(nativeScrollRef).toBeTruthy();
      nativeScrollRef.scrollTo = scrollToSpy;
      return { result, ref, scrollToSpy };
    };

    const reportContentSize = (
      result: ReturnType<typeof render>,
      width: number,
      height: number
    ) => {
      // The scroll view is the node that receives both onScroll and onContentSizeChange
      const scrollable = result.findWhere(
        (node: any) => node.props.onScroll && node.props.onContentSizeChange
      );
      if (!scrollable) throw new Error("Could not find scrollable component");
      const onContentSizeChange: any = scrollable.prop(
        "onContentSizeChange" as never
      );
      result.act(() => {
        onContentSizeChange(width, height);
      });
    };

    const centerLastItem = (
      result: ReturnType<typeof render>,
      ref: React.RefObject<FlashListRef<number>>
    ) => {
      result.act(() => {
        ref.current?.scrollToIndex({
          index: data.length - 1,
          viewPosition: 0.5,
          animated: false,
        });
      });
      jest.runAllTimers();
    };

    const lastScrollTo = (scrollToSpy: jest.Mock) =>
      scrollToSpy.mock.calls[scrollToSpy.mock.calls.length - 1][0];

    const lastScrollToY = (scrollToSpy: jest.Mock) =>
      lastScrollTo(scrollToSpy).y;

    it("falls back to the layout size before a content size is reported", () => {
      const { result, ref, scrollToSpy } = renderList();

      centerLastItem(result, ref);

      expect(lastScrollToY(scrollToSpy)).toBe(1101);
    });

    it("scrolls into a footer or bottom padding reported by the scroll view", () => {
      const { result, ref, scrollToSpy } = renderList();

      // 400px of footer/padding after the items
      reportContentSize(result, 399, 2400);
      centerLastItem(result, ref);

      expect(lastScrollToY(scrollToSpy)).toBe(1500.5);
    });

    it("still clamps to the end of the reported content", () => {
      const { result, ref, scrollToSpy } = renderList();

      // Only 200px after the items: not enough room to center the last item
      reportContentSize(result, 399, 2200);
      centerLastItem(result, ref);

      expect(lastScrollToY(scrollToSpy)).toBe(2200 - 899);
    });

    it("uses the layout size when the reported content size is smaller (stale)", () => {
      const { result, ref, scrollToSpy } = renderList();

      reportContentSize(result, 399, 1500);
      centerLastItem(result, ref);

      expect(lastScrollToY(scrollToSpy)).toBe(1101);
    });

    it("ignores invalid content sizes", () => {
      const { result, ref, scrollToSpy } = renderList();

      reportContentSize(result, 399, NaN);
      reportContentSize(result, 399, -1);
      centerLastItem(result, ref);

      expect(lastScrollToY(scrollToSpy)).toBe(1101);
    });

    it("uses the content width for horizontal lists", () => {
      // 20 items of 100px in a 399px wide window: layout-based max offset is
      // 2000 - 399 = 1601. Centering the last item needs 1900 - (399 - 100) * 0.5 = 1750.5.
      const { result, ref, scrollToSpy } = renderList({ horizontal: true });

      centerLastItem(result, ref);
      expect(lastScrollTo(scrollToSpy).x).toBe(1601);

      reportContentSize(result, 2400, 899);
      centerLastItem(result, ref);
      expect(lastScrollTo(scrollToSpy).x).toBe(1750.5);
    });

    it("forwards onContentSizeChange to the user's handler", () => {
      const onContentSizeChange = jest.fn();
      const { result } = renderList({ onContentSizeChange });

      reportContentSize(result, 399, 2400);

      expect(onContentSizeChange).toHaveBeenCalledWith(399, 2400);
    });
  });

  describe("autoscrolling to bottom is suppressed while offset projection is disabled", () => {
    const scrollTo = (root: ReturnType<typeof render>, y: number) => {
      const scrollable = root.findWhere((node: any) => node.props.onScroll);
      if (!scrollable) throw new Error("Could not find scrollable component");

      const onScroll: any = scrollable.prop("onScroll" as never);
      root.act(() => {
        onScroll({
          nativeEvent: {
            contentOffset: { x: 0, y },
            contentSize: { width: 399, height: 2000 },
            layoutMeasurement: { width: 399, height: 899 },
          },
        });
      });
    };

    const renderChatList = (data: number[]) => {
      const ref = createRef<FlashListRef<number>>();
      const result = render(
        <FlashList
          ref={ref}
          data={data}
          renderItem={({ item }) => <Text>{item}</Text>}
          maintainVisibleContentPosition={{
            autoscrollToBottomThreshold: 1,
            animateAutoScrollToBottom: false,
            startRenderingFromBottom: true,
          }}
        />
      );
      return { result, ref };
    };

    const { measureItemLayout } = jest.requireMock(
      "../recyclerview/utils/measureLayout"
    ) as { measureItemLayout: jest.Mock };

    it("does not fire scrollToEnd from the autoscroll path while scrollToIndex is in flight", () => {
      const data = Array.from({ length: 20 }, (_, i) => i);
      const { result, ref } = renderChatList(data);

      const scrollToEndSpy = jest.fn();
      const nativeScrollRef = ref.current?.getNativeScrollRef() as any;
      expect(nativeScrollRef).toBeTruthy();
      nativeScrollRef.scrollToEnd = scrollToEndSpy;

      // 1. Load the target message into memory: scroll up so index 5
      //    renders and is laid out at least once. After this, FlashList
      //    has measurements for the target.
      scrollTo(result, 200);
      jest.runAllTimers();

      // 2. Return to the bottom to arm MVCP autoscroll. The momentum-end
      //    path in onScrollHandler refreshes firstVisibleItemKey /
      //    firstVisibleItemLayout to a snapshot of the current anchor.
      scrollTo(result, 1101);
      jest.runAllTimers();

      // 3. Sit still past useBoundDetection's 100ms checkBounds guard.
      jest.advanceTimersByTime(150);
      scrollToEndSpy.mockClear();

      // 4. Simulate the background remeasurement that drifts the cached
      //    anchor layout in an app. We change the mock so the next
      //    measurement pass produces different item heights than the ones
      //    cached in firstVisibleItemLayout.current. In production this
      //    drift is a bunch  of estimates resolving into measurements
      //    while the user sits still; in jest, we make it coarse so the
      //    cascade is observable.
      measureItemLayout.mockImplementation(() => ({
        x: 0,
        y: 0,
        width: 100,
        height: 50,
      }));

      // 5. Programmatic scrollToIndex on the already rendered target.
      //    Internally: setOffsetProjectionEnabled(false), then drives the
      //    scroll via setRenderId++. The upcoming rerender runs the
      //    layout measurement useLayoutEffect, which absorbs the new
      //    (drifted) heights via modifyChildrenLayout. contentHeight
      //    therefore shifts between renders, which is exactly the
      //    misalignment that fires useBoundDetection's second useEffect
      //    in an actual app.
      result.act(() => {
        ref.current?.scrollToIndex({
          index: 5,
          animated: false,
          viewPosition: 0.5,
        });
      });
      jest.advanceTimersByTime(50);

      expect(scrollToEndSpy).not.toHaveBeenCalled();
    });

    it("fires scrollToEnd from the autoscroll path when isOffsetProjectionEnabled is true", () => {
      const data = Array.from({ length: 20 }, (_, i) => i);
      const { result, ref } = renderChatList(data);

      const scrollToEndSpy = jest.fn();
      const nativeScrollRef = ref.current?.getNativeScrollRef() as any;
      expect(nativeScrollRef).toBeTruthy();
      nativeScrollRef.scrollToEnd = scrollToEndSpy;

      scrollTo(result, 1101);
      jest.runAllTimers();
      scrollToEndSpy.mockClear();

      result.setProps({ data: [...data, 100] });
      jest.runAllTimers();

      expect(scrollToEndSpy).toHaveBeenCalled();
    });
  });
});
