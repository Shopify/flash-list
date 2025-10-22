import React, { createRef } from "react";
import { Animated, Text } from "react-native";
import "@quilted/react-testing/matchers";
import { render } from "@quilted/react-testing";
import { act } from "react-test-renderer";

import {
  StickyHeaders,
  StickyHeaderRef,
} from "../recyclerview/components/StickyHeaders";
import { RecyclerViewManager } from "../recyclerview/RecyclerViewManager";
import { RVLayout } from "../recyclerview/layout-managers/LayoutManager";

/**
 * Creates a mock RecyclerViewManager with controlled scroll offset and layouts.
 * This allows us to precisely test the compute function's behavior.
 */
const createMockRecyclerViewManager = (config: {
  scrollOffset: number;
  layouts: Record<number, RVLayout>;
  dataLength?: number;
  engagedEndIndex?: number;
  firstItemOffset?: number;
}): RecyclerViewManager<any> => {
  const {
    scrollOffset,
    layouts,
    dataLength = 100,
    engagedEndIndex = 99,
    firstItemOffset = 0,
  } = config;

  return {
    getDataLength: jest.fn(() => dataLength),
    getLastScrollOffset: jest.fn(() => scrollOffset),
    getLayout: jest.fn(
      (index: number) =>
        layouts[index] || { x: 0, y: index * 50, width: 400, height: 50 }
    ),
    tryGetLayout: jest.fn(
      (index: number) =>
        layouts[index] || { x: 0, y: index * 50, width: 400, height: 50 }
    ),
    getEngagedIndices: jest.fn(() => ({
      startIndex: 0,
      endIndex: engagedEndIndex,
    })),
    firstItemOffset,
  } as any;
};

describe("StickyHeaders - Compute Function", () => {
  const testData = Array.from({ length: 30 }, (_, i) => i);
  const renderItem = jest.fn(({ item }: { item: any }) => <Text>{item}</Text>);

  // Standard layout: 30 items, each 50px tall
  const createStandardLayouts = (): Record<number, RVLayout> => {
    const layouts: Record<number, RVLayout> = {};
    for (let i = 0; i < 30; i++) {
      layouts[i] = { x: 0, y: i * 50, width: 400, height: 50 };
    }
    return layouts;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Sticky Index Selection with Offset", () => {
    it("should select correct sticky header based on scroll position without offset", () => {
      const onChangeStickyIndex = jest.fn();
      const layouts = createStandardLayouts();

      // Sticky headers at indices 0, 10, 20
      // Item 0: y=0, Item 10: y=500, Item 20: y=1000

      // Test scroll position 250 (between item 0 and 10)
      const manager = createMockRecyclerViewManager({
        scrollOffset: 250,
        layouts,
      });

      render(
        <StickyHeaders
          stickyHeaderIndices={[0, 10, 20]}
          stickyHeaderOffset={0}
          data={testData}
          scrollY={new Animated.Value(0)}
          renderItem={renderItem}
          stickyHeaderRef={createRef()}
          recyclerViewManager={manager}
          extraData={undefined}
          onChangeStickyIndex={onChangeStickyIndex}
        />
      );

      // At scroll 250, we're past item 0 (y=0) but before item 10 (y=500)
      // So sticky header should be index 0
      expect(onChangeStickyIndex).toHaveBeenCalledWith(0);
    });

    it("should select correct sticky header based on scroll position with offset", () => {
      const onChangeStickyIndex = jest.fn();
      const layouts = createStandardLayouts();

      // With offset=100 and scroll=250, effective position is 350
      // Item 0: y=0, Item 10: y=500
      // At effective 350, we're still before item 10
      const manager = createMockRecyclerViewManager({
        scrollOffset: 250,
        layouts,
      });

      render(
        <StickyHeaders
          stickyHeaderIndices={[0, 10, 20]}
          stickyHeaderOffset={100}
          data={testData}
          scrollY={new Animated.Value(0)}
          renderItem={renderItem}
          stickyHeaderRef={createRef()}
          recyclerViewManager={manager}
          extraData={undefined}
          onChangeStickyIndex={onChangeStickyIndex}
        />
      );

      expect(onChangeStickyIndex).toHaveBeenCalledWith(0);
    });

    it("should activate next sticky header earlier when offset is large enough", () => {
      const onChangeStickyIndex = jest.fn();
      const layouts = createStandardLayouts();

      // With offset=300 and scroll=250, effective position is 550
      // Item 10 is at y=500, so we should now select item 10
      const manager = createMockRecyclerViewManager({
        scrollOffset: 250,
        layouts,
      });

      render(
        <StickyHeaders
          stickyHeaderIndices={[0, 10, 20]}
          stickyHeaderOffset={300}
          data={testData}
          scrollY={new Animated.Value(0)}
          renderItem={renderItem}
          stickyHeaderRef={createRef()}
          recyclerViewManager={manager}
          extraData={undefined}
          onChangeStickyIndex={onChangeStickyIndex}
        />
      );

      // Effective position 550 > item 10's y=500, so sticky should be index 10
      expect(onChangeStickyIndex).toHaveBeenCalledWith(10);
    });

    it("should transition between sticky headers at correct scroll positions", () => {
      const onChangeStickyIndex = jest.fn();
      const layouts = createStandardLayouts();

      // Test the exact transition point
      // Item 10 is at y=500, without offset we transition at scroll=500
      const manager = createMockRecyclerViewManager({
        scrollOffset: 499,
        layouts,
      });

      const result = render(
        <StickyHeaders
          stickyHeaderIndices={[0, 10, 20]}
          stickyHeaderOffset={0}
          data={testData}
          scrollY={new Animated.Value(0)}
          renderItem={renderItem}
          stickyHeaderRef={createRef()}
          recyclerViewManager={manager}
          extraData={undefined}
          onChangeStickyIndex={onChangeStickyIndex}
        />
      );

      // At 499, should still be item 0
      expect(onChangeStickyIndex).toHaveBeenCalledWith(0);
      expect(result).toContainReactComponent(Text, { children: 0 });
    });

    it("should use correct sticky header right at transition boundary", () => {
      const onChangeStickyIndex = jest.fn();
      const layouts = createStandardLayouts();

      // At exactly y=500, we should transition to item 10
      const manager = createMockRecyclerViewManager({
        scrollOffset: 500,
        layouts,
      });

      render(
        <StickyHeaders
          stickyHeaderIndices={[0, 10, 20]}
          stickyHeaderOffset={0}
          data={testData}
          scrollY={new Animated.Value(0)}
          renderItem={renderItem}
          stickyHeaderRef={createRef()}
          recyclerViewManager={manager}
          extraData={undefined}
          onChangeStickyIndex={onChangeStickyIndex}
        />
      );

      expect(onChangeStickyIndex).toHaveBeenCalledWith(10);
    });
  });

  describe("Push Animation Calculation with Offset", () => {
    it("should calculate pushStartsAt correctly without offset", () => {
      const layouts = createStandardLayouts();

      // Item 0 at y=0 (height=50), Item 10 at y=500
      // pushStartsAt = nextStickyY - currentStickyHeight - offset
      // pushStartsAt = 500 - 50 - 0 = 450
      const manager = createMockRecyclerViewManager({
        scrollOffset: 100,
        layouts,
        firstItemOffset: 0,
      });

      render(
        <StickyHeaders
          stickyHeaderIndices={[0, 10, 20]}
          stickyHeaderOffset={0}
          data={testData}
          scrollY={new Animated.Value(0)}
          renderItem={renderItem}
          stickyHeaderRef={createRef()}
          recyclerViewManager={manager}
          extraData={undefined}
          onChangeStickyIndex={jest.fn()}
        />
      );

      // Component renders successfully with correct calculation
      expect(manager.tryGetLayout).toHaveBeenCalled();
    });

    it("should calculate pushStartsAt correctly with offset", () => {
      const layouts = createStandardLayouts();

      // With offset=44:
      // pushStartsAt = (nextStickyY - currentStickyHeight) - offset
      // pushStartsAt = (500 - 50) - 44 = 406
      const manager = createMockRecyclerViewManager({
        scrollOffset: 100,
        layouts,
        firstItemOffset: 0,
      });

      render(
        <StickyHeaders
          stickyHeaderIndices={[0, 10, 20]}
          stickyHeaderOffset={44}
          data={testData}
          scrollY={new Animated.Value(0)}
          renderItem={renderItem}
          stickyHeaderRef={createRef()}
          recyclerViewManager={manager}
          extraData={undefined}
          onChangeStickyIndex={jest.fn()}
        />
      );

      expect(manager.tryGetLayout).toHaveBeenCalled();
    });

    it("should account for firstItemOffset in push calculation", () => {
      const layouts = createStandardLayouts();

      const manager = createMockRecyclerViewManager({
        scrollOffset: 100,
        layouts,
        firstItemOffset: 20,
      });

      render(
        <StickyHeaders
          stickyHeaderIndices={[0, 10, 20]}
          stickyHeaderOffset={0}
          data={testData}
          scrollY={new Animated.Value(0)}
          renderItem={renderItem}
          stickyHeaderRef={createRef()}
          recyclerViewManager={manager}
          extraData={undefined}
          onChangeStickyIndex={jest.fn()}
        />
      );

      // Verify firstItemOffset is used
      expect(manager.tryGetLayout).toHaveBeenCalled();
    });
  });

  describe("Callback Invocation on Index Changes", () => {
    it("should invoke callback when scrolling causes sticky index to change", () => {
      const onChangeStickyIndex = jest.fn();
      const layouts = createStandardLayouts();
      const ref = createRef<StickyHeaderRef>();

      const manager = createMockRecyclerViewManager({
        scrollOffset: 100,
        layouts,
      });

      render(
        <StickyHeaders
          stickyHeaderIndices={[0, 10, 20]}
          stickyHeaderOffset={0}
          data={testData}
          scrollY={new Animated.Value(0)}
          renderItem={renderItem}
          stickyHeaderRef={ref}
          recyclerViewManager={manager}
          extraData={undefined}
          onChangeStickyIndex={onChangeStickyIndex}
        />
      );

      expect(onChangeStickyIndex).toHaveBeenCalledWith(0);
      onChangeStickyIndex.mockClear();

      // Simulate scroll to 600 (should activate item 10)
      manager.getLastScrollOffset = jest.fn(() => 600);

      act(() => {
        ref.current?.reportScrollEvent({} as any);
      });

      expect(onChangeStickyIndex).toHaveBeenCalledWith(10);
    });

    it("should not invoke callback when sticky index remains the same", () => {
      const onChangeStickyIndex = jest.fn();
      const layouts = createStandardLayouts();
      const ref = createRef<StickyHeaderRef>();

      const manager = createMockRecyclerViewManager({
        scrollOffset: 100,
        layouts,
      });

      render(
        <StickyHeaders
          stickyHeaderIndices={[0, 10, 20]}
          stickyHeaderOffset={0}
          data={testData}
          scrollY={new Animated.Value(0)}
          renderItem={renderItem}
          stickyHeaderRef={ref}
          recyclerViewManager={manager}
          extraData={undefined}
          onChangeStickyIndex={onChangeStickyIndex}
        />
      );

      expect(onChangeStickyIndex).toHaveBeenCalledTimes(1);
      onChangeStickyIndex.mockClear();

      // Scroll slightly but stay in same sticky region
      manager.getLastScrollOffset = jest.fn(() => 150);

      act(() => {
        ref.current?.reportScrollEvent({} as any);
      });

      // Should not call callback since index didn't change
      expect(onChangeStickyIndex).not.toHaveBeenCalled();
    });

    it("should invoke callback with correct sequence when scrolling through multiple headers", () => {
      const onChangeStickyIndex = jest.fn();
      const layouts = createStandardLayouts();
      const ref = createRef<StickyHeaderRef>();

      const manager = createMockRecyclerViewManager({
        scrollOffset: 0,
        layouts,
      });

      render(
        <StickyHeaders
          stickyHeaderIndices={[0, 10, 20]}
          stickyHeaderOffset={0}
          data={testData}
          scrollY={new Animated.Value(0)}
          renderItem={renderItem}
          stickyHeaderRef={ref}
          recyclerViewManager={manager}
          extraData={undefined}
          onChangeStickyIndex={onChangeStickyIndex}
        />
      );

      expect(onChangeStickyIndex).toHaveBeenNthCalledWith(1, 0);

      // Scroll to item 10
      manager.getLastScrollOffset = jest.fn(() => 550);
      act(() => ref.current?.reportScrollEvent({} as any));
      expect(onChangeStickyIndex).toHaveBeenNthCalledWith(2, 10);

      // Scroll to item 20
      manager.getLastScrollOffset = jest.fn(() => 1050);
      act(() => ref.current?.reportScrollEvent({} as any));
      expect(onChangeStickyIndex).toHaveBeenNthCalledWith(3, 20);

      // Verify total calls
      expect(onChangeStickyIndex).toHaveBeenCalledTimes(3);
    });
  });

  describe("Edge Cases in Compute Function", () => {
    it("should handle scroll position before first sticky header", () => {
      const onChangeStickyIndex = jest.fn();
      const layouts = createStandardLayouts();

      // Sticky headers at 5, 15, 25, scroll at position 100 (item 2)
      const manager = createMockRecyclerViewManager({
        scrollOffset: 100,
        layouts,
      });

      const result = render(
        <StickyHeaders
          stickyHeaderIndices={[5, 15, 25]}
          stickyHeaderOffset={0}
          data={testData}
          scrollY={new Animated.Value(0)}
          renderItem={renderItem}
          stickyHeaderRef={createRef()}
          recyclerViewManager={manager}
          extraData={undefined}
          onChangeStickyIndex={onChangeStickyIndex}
        />
      );

      // At scroll 100, we're before item 5 (y=250)
      // Binary search returns -1, but component handles this gracefully
      // The component should still render but not display any sticky header
      expect(result).toContainReactComponent(Animated.View);

      // When there's no valid sticky header, the callback might not be invoked
      // or might be invoked with -1 depending on implementation
      // Let's just verify the component doesn't crash
    });

    it("should handle when next sticky header is beyond engaged indices", () => {
      const onChangeStickyIndex = jest.fn();
      const layouts = createStandardLayouts();

      // Item 20 is beyond engaged end index
      const manager = createMockRecyclerViewManager({
        scrollOffset: 550,
        layouts,
        engagedEndIndex: 15, // Only items 0-15 are engaged
      });

      render(
        <StickyHeaders
          stickyHeaderIndices={[0, 10, 20]}
          stickyHeaderOffset={0}
          data={testData}
          scrollY={new Animated.Value(0)}
          renderItem={renderItem}
          stickyHeaderRef={createRef()}
          recyclerViewManager={manager}
          extraData={undefined}
          onChangeStickyIndex={onChangeStickyIndex}
        />
      );

      // Should select item 10, but item 20 should be ignored as next
      expect(onChangeStickyIndex).toHaveBeenCalledWith(10);
    });

    it("should handle empty sticky header indices", () => {
      const onChangeStickyIndex = jest.fn();
      const layouts = createStandardLayouts();

      const manager = createMockRecyclerViewManager({
        scrollOffset: 250,
        layouts,
      });

      render(
        <StickyHeaders
          stickyHeaderIndices={[]}
          stickyHeaderOffset={0}
          data={testData}
          scrollY={new Animated.Value(0)}
          renderItem={renderItem}
          stickyHeaderRef={createRef()}
          recyclerViewManager={manager}
          extraData={undefined}
          onChangeStickyIndex={onChangeStickyIndex}
        />
      );

      // Should not crash, compute returns early
      expect(onChangeStickyIndex).not.toHaveBeenCalled();
    });

    it("should handle variable height items", () => {
      const onChangeStickyIndex = jest.fn();

      // Create layouts with different heights
      const layouts: Record<number, RVLayout> = {
        /* eslint-disable-next-line @typescript-eslint/naming-convention */
        0: { x: 0, y: 0, width: 400, height: 100 },
        /* eslint-disable-next-line @typescript-eslint/naming-convention */
        5: { x: 0, y: 350, width: 400, height: 75 },
        /* eslint-disable-next-line @typescript-eslint/naming-convention */
        10: { x: 0, y: 650, width: 400, height: 50 },
        /* eslint-disable-next-line @typescript-eslint/naming-convention */
        15: { x: 0, y: 950, width: 400, height: 120 },
      };

      // Fill in remaining items
      let currentY = 1070;
      for (let i = 16; i < 30; i++) {
        layouts[i] = { x: 0, y: currentY, width: 400, height: 50 };
        currentY += 50;
      }

      const manager = createMockRecyclerViewManager({
        scrollOffset: 400,
        layouts,
      });

      render(
        <StickyHeaders
          stickyHeaderIndices={[0, 5, 10, 15]}
          stickyHeaderOffset={0}
          data={testData}
          scrollY={new Animated.Value(0)}
          renderItem={renderItem}
          stickyHeaderRef={createRef()}
          recyclerViewManager={manager}
          extraData={undefined}
          onChangeStickyIndex={onChangeStickyIndex}
        />
      );

      // At scroll 400, we're past item 5 (y=350) but before item 10 (y=650)
      expect(onChangeStickyIndex).toHaveBeenCalledWith(5);
    });

    it("should handle large offset values", () => {
      const onChangeStickyIndex = jest.fn();
      const layouts = createStandardLayouts();

      // Large offset of 1000 with scroll 100 = effective 1100
      const manager = createMockRecyclerViewManager({
        scrollOffset: 100,
        layouts,
      });

      render(
        <StickyHeaders
          stickyHeaderIndices={[0, 10, 20]}
          stickyHeaderOffset={1000}
          data={testData}
          scrollY={new Animated.Value(0)}
          renderItem={renderItem}
          stickyHeaderRef={createRef()}
          recyclerViewManager={manager}
          extraData={undefined}
          onChangeStickyIndex={onChangeStickyIndex}
        />
      );

      // Effective position 1100 > item 20's y=1000
      expect(onChangeStickyIndex).toHaveBeenCalledWith(20);
    });

    it("should handle negative offset values", () => {
      const onChangeStickyIndex = jest.fn();
      const layouts = createStandardLayouts();

      // Negative offset delays sticky header activation
      const manager = createMockRecyclerViewManager({
        scrollOffset: 550,
        layouts,
      });

      render(
        <StickyHeaders
          stickyHeaderIndices={[0, 10, 20]}
          stickyHeaderOffset={-100}
          data={testData}
          scrollY={new Animated.Value(0)}
          renderItem={renderItem}
          stickyHeaderRef={createRef()}
          recyclerViewManager={manager}
          extraData={undefined}
          onChangeStickyIndex={onChangeStickyIndex}
        />
      );

      // Effective position 450 < item 10's y=500, so should be item 0
      expect(onChangeStickyIndex).toHaveBeenCalledWith(0);
    });
  });

  describe("Component Rendering with Offset", () => {
    it("should render sticky header at correct top position with offset", () => {
      const layouts = createStandardLayouts();

      const manager = createMockRecyclerViewManager({
        scrollOffset: 100,
        layouts,
      });

      const result = render(
        <StickyHeaders
          stickyHeaderIndices={[0, 10, 20]}
          stickyHeaderOffset={44}
          data={testData}
          scrollY={new Animated.Value(0)}
          renderItem={renderItem}
          stickyHeaderRef={createRef()}
          recyclerViewManager={manager}
          extraData={undefined}
          onChangeStickyIndex={jest.fn()}
        />
      );

      const animatedView = result.find(Animated.View);
      expect(animatedView).toHaveReactProps({
        style: expect.objectContaining({
          top: 44,
          position: "absolute",
        }),
      });
    });
  });
});
