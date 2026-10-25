import React, { createRef } from "react";
import { Animated, Text } from "react-native";
import "@quilted/react-testing/matchers";
import { render } from "@quilted/react-testing";

import {
  StickyFooters,
  StickyFooterRef,
} from "../recyclerview/components/StickyFooters";
import { RecyclerViewManager } from "../recyclerview/RecyclerViewManager";
import { RVLayout } from "../recyclerview/layout-managers/LayoutManager";
import { ViewHolder } from "../recyclerview/ViewHolder";

const WINDOW_HEIGHT = 400;

/**
 * Creates a mock RecyclerViewManager with controlled scroll offset, window size and layouts.
 * This allows us to precisely test the compute function's behavior.
 */
const createMockRecyclerViewManager = (config: {
  scrollOffset: number;
  layouts: Record<number, RVLayout>;
  dataLength?: number;
  engagedStartIndex?: number;
  firstItemOffset?: number;
}): RecyclerViewManager<any> => {
  const {
    scrollOffset,
    layouts,
    dataLength = 30,
    engagedStartIndex = 0,
    firstItemOffset = 0,
  } = config;

  return {
    getDataLength: jest.fn(() => dataLength),
    getLastScrollOffset: jest.fn(() => scrollOffset),
    getWindowSize: jest.fn(() => ({ width: 400, height: WINDOW_HEIGHT })),
    getLayout: jest.fn((index: number) => layouts[index]),
    tryGetLayout: jest.fn((index: number) => layouts[index]),
    getEngagedIndices: jest.fn(() => ({
      startIndex: engagedStartIndex,
      endIndex: dataLength - 1,
    })),
    firstItemOffset,
  } as any;
};

describe("StickyFooters - Compute Function", () => {
  const testData = Array.from({ length: 30 }, (_, i) => i);
  const renderItem = jest.fn(({ item }: { item: any }) => <Text>{item}</Text>);

  // Standard layout: 30 items, each 50px tall
  // Footers at 9, 19, 29 have bottoms at 500, 1000, 1500
  const createStandardLayouts = (): Record<number, RVLayout> => {
    const layouts: Record<number, RVLayout> = {};
    for (let i = 0; i < 30; i++) {
      layouts[i] = { x: 0, y: i * 50, width: 400, height: 50 };
    }
    return layouts;
  };

  const renderStickyFooters = ({
    manager,
    stickyFooterIndices = [9, 19, 29],
    stickyFooterOffset = 0,
    scrollY = new Animated.Value(0),
    ref = createRef<StickyFooterRef>(),
    onChangeStickyIndex,
    stickyFooterZIndex,
    inverted,
  }: {
    manager: RecyclerViewManager<any>;
    stickyFooterIndices?: number[];
    stickyFooterOffset?: number;
    scrollY?: Animated.Value;
    ref?: React.RefObject<StickyFooterRef>;
    onChangeStickyIndex?: (current: number, previous: number) => void;
    stickyFooterZIndex?: number;
    inverted?: boolean;
  }) =>
    render(
      <StickyFooters
        stickyFooterIndices={stickyFooterIndices}
        stickyFooterOffset={stickyFooterOffset}
        data={testData}
        scrollY={scrollY}
        renderItem={renderItem}
        stickyFooterRef={ref}
        recyclerViewManager={manager}
        extraData={undefined}
        onChangeStickyIndex={onChangeStickyIndex}
        stickyFooterZIndex={stickyFooterZIndex}
        inverted={inverted}
      />
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Sticky Index Selection", () => {
    it("should stick the first footer below the viewport at the top of the list", () => {
      // Bottom line = 0 + 400, footer 9's bottom (500) is below it
      const manager = createMockRecyclerViewManager({
        scrollOffset: 0,
        layouts: createStandardLayouts(),
      });

      const result = renderStickyFooters({ manager });

      expect(result).toContainReactComponent(Text, { children: 9 });
    });

    it("should keep the footer sticky right at the boundary", () => {
      // Bottom line = 100 + 400 = 500, equal to footer 9's bottom
      const manager = createMockRecyclerViewManager({
        scrollOffset: 100,
        layouts: createStandardLayouts(),
      });

      const result = renderStickyFooters({ manager });

      expect(result).toContainReactComponent(Text, { children: 9 });
    });

    it("should move to the next footer once the current one is fully visible", () => {
      // Bottom line = 101 + 400 = 501, past footer 9's bottom
      const manager = createMockRecyclerViewManager({
        scrollOffset: 101,
        layouts: createStandardLayouts(),
      });

      const result = renderStickyFooters({ manager });

      expect(result).toContainReactComponent(Text, { children: 19 });
    });

    it("should account for the sticky footer offset", () => {
      // Bottom line = 150 + 400 - 100 = 450, footer 9's bottom (500) is below it
      const manager = createMockRecyclerViewManager({
        scrollOffset: 150,
        layouts: createStandardLayouts(),
      });

      const result = renderStickyFooters({ manager, stickyFooterOffset: 100 });

      expect(result).toContainReactComponent(Text, { children: 9 });
    });

    it("should render no footer when all footers are visible", () => {
      // Bottom line = 1200 + 400 = 1600, past footer 29's bottom
      const manager = createMockRecyclerViewManager({
        scrollOffset: 1200,
        layouts: createStandardLayouts(),
      });

      const result = renderStickyFooters({ manager });

      expect(result).not.toContainReactComponent(ViewHolder);
    });

    it("should handle unsorted footer indices", () => {
      const manager = createMockRecyclerViewManager({
        scrollOffset: 101,
        layouts: createStandardLayouts(),
      });

      const result = renderStickyFooters({
        manager,
        stickyFooterIndices: [29, 9, 19],
      });

      expect(result).toContainReactComponent(Text, { children: 19 });
    });

    it("should handle empty sticky footer indices", () => {
      const manager = createMockRecyclerViewManager({
        scrollOffset: 0,
        layouts: createStandardLayouts(),
      });

      const result = renderStickyFooters({ manager, stickyFooterIndices: [] });

      expect(result).not.toContainReactComponent(ViewHolder);
    });

    it("should do nothing when an index is out of data range", () => {
      const manager = createMockRecyclerViewManager({
        scrollOffset: 0,
        layouts: createStandardLayouts(),
      });

      const result = renderStickyFooters({
        manager,
        stickyFooterIndices: [9, 30],
      });

      expect(result).not.toContainReactComponent(ViewHolder);
    });
  });

  describe("Scroll Updates", () => {
    it("should update the sticky footer as the list scrolls", () => {
      const ref = createRef<StickyFooterRef>();
      const manager = createMockRecyclerViewManager({
        scrollOffset: 0,
        layouts: createStandardLayouts(),
      });

      const result = renderStickyFooters({ manager, ref });
      expect(result).toContainReactComponent(Text, { children: 9 });

      manager.getLastScrollOffset = jest.fn(() => 700);
      result.act(() => ref.current?.reportScrollEvent({} as any));
      expect(result).toContainReactComponent(Text, { children: 29 });

      manager.getLastScrollOffset = jest.fn(() => 50);
      result.act(() => ref.current?.reportScrollEvent({} as any));
      expect(result).toContainReactComponent(Text, { children: 9 });
    });
  });

  describe("Callback Invocation on Index Changes", () => {
    it("should report the current and previous index as the list scrolls", () => {
      const onChangeStickyIndex = jest.fn();
      const ref = createRef<StickyFooterRef>();
      const manager = createMockRecyclerViewManager({
        scrollOffset: 0,
        layouts: createStandardLayouts(),
      });

      const result = renderStickyFooters({ manager, ref, onChangeStickyIndex });
      expect(onChangeStickyIndex).toHaveBeenNthCalledWith(1, 9, -1);

      manager.getLastScrollOffset = jest.fn(() => 700);
      result.act(() => ref.current?.reportScrollEvent({} as any));
      expect(onChangeStickyIndex).toHaveBeenNthCalledWith(2, 29, 9);

      // All footers visible
      manager.getLastScrollOffset = jest.fn(() => 1200);
      result.act(() => ref.current?.reportScrollEvent({} as any));
      expect(onChangeStickyIndex).toHaveBeenNthCalledWith(3, -1, 29);

      expect(onChangeStickyIndex).toHaveBeenCalledTimes(3);
    });

    it("should not invoke the callback when the sticky index stays the same", () => {
      const onChangeStickyIndex = jest.fn();
      const ref = createRef<StickyFooterRef>();
      const manager = createMockRecyclerViewManager({
        scrollOffset: 0,
        layouts: createStandardLayouts(),
      });

      const result = renderStickyFooters({ manager, ref, onChangeStickyIndex });
      onChangeStickyIndex.mockClear();

      manager.getLastScrollOffset = jest.fn(() => 50);
      result.act(() => ref.current?.reportScrollEvent({} as any));

      expect(onChangeStickyIndex).not.toHaveBeenCalled();
    });
  });

  describe("Push Animation Calculation", () => {
    it("should start the push when the previous footer reaches the sticky area", () => {
      const scrollY = new Animated.Value(0);
      const interpolateSpy = jest.spyOn(scrollY, "interpolate");
      const manager = createMockRecyclerViewManager({
        scrollOffset: 150,
        layouts: createStandardLayouts(),
      });

      renderStickyFooters({ manager, scrollY });

      // Current footer is 19, previous footer 9 has its bottom at 500
      // pushStartsAt = 500 - (400 - 0 - 50) = 150
      expect(interpolateSpy).toHaveBeenLastCalledWith({
        inputRange: [100, 150],
        outputRange: [50, 0],
        extrapolate: "clamp",
      });
    });

    it("should not push when the previous footer is outside engaged indices", () => {
      const scrollY = new Animated.Value(0);
      const interpolateSpy = jest.spyOn(scrollY, "interpolate");
      const manager = createMockRecyclerViewManager({
        scrollOffset: 150,
        layouts: createStandardLayouts(),
        engagedStartIndex: 10,
      });

      renderStickyFooters({ manager, scrollY });

      expect(interpolateSpy).toHaveBeenLastCalledWith(
        expect.objectContaining({
          inputRange: [Number.MIN_SAFE_INTEGER - 50, Number.MIN_SAFE_INTEGER],
        })
      );
    });
  });

  describe("With ListHeaderComponent offset", () => {
    // A 100px ListHeaderComponent sits above the items, so firstItemOffset = 100.
    // getLastScrollOffset() is relative to the item container (absolute scroll - 100).
    const firstItemOffset = 100;

    it("should keep the footer sticky until its cell is fully visible", () => {
      // Relative scroll 100 => bottom line 500, equal to footer 9's bottom
      const manager = createMockRecyclerViewManager({
        scrollOffset: 100,
        layouts: createStandardLayouts(),
        firstItemOffset,
      });

      const result = renderStickyFooters({ manager });

      expect(result).toContainReactComponent(Text, { children: 9 });
    });

    it("should not keep a fully visible footer sticky because of the header offset", () => {
      // Relative scroll 101 => bottom line 501, footer 9 (bottom 500) is fully visible
      const manager = createMockRecyclerViewManager({
        scrollOffset: 101,
        layouts: createStandardLayouts(),
        firstItemOffset,
      });

      const result = renderStickyFooters({ manager });

      expect(result).toContainReactComponent(Text, { children: 19 });
      expect(result).not.toContainReactComponent(ViewHolder, { index: 9 });
    });

    it("should include the header offset in the push calculation", () => {
      const scrollY = new Animated.Value(0);
      const interpolateSpy = jest.spyOn(scrollY, "interpolate");
      const manager = createMockRecyclerViewManager({
        scrollOffset: 101,
        layouts: createStandardLayouts(),
        firstItemOffset,
      });

      renderStickyFooters({ manager, scrollY });

      // scrollY is the absolute content offset, so footer 9's bottom is 500 + 100 = 600
      // pushStartsAt = 600 - (400 - 0 - 50) = 250
      expect(interpolateSpy).toHaveBeenLastCalledWith({
        inputRange: [200, 250],
        outputRange: [50, 0],
        extrapolate: "clamp",
      });
    });
  });

  describe("Component Rendering", () => {
    it("should render the sticky footer at the bottom with offset", () => {
      const manager = createMockRecyclerViewManager({
        scrollOffset: 0,
        layouts: createStandardLayouts(),
      });

      const result = renderStickyFooters({ manager, stickyFooterOffset: 44 });

      expect(result.find(Animated.View)).toHaveReactProps({
        style: expect.objectContaining({
          bottom: 44,
          position: "absolute",
        }),
      });
    });

    it("should render the sticky footer with configured zIndex", () => {
      const manager = createMockRecyclerViewManager({
        scrollOffset: 0,
        layouts: createStandardLayouts(),
      });

      const result = renderStickyFooters({ manager, stickyFooterZIndex: 7 });

      expect(result.find(Animated.View)).toHaveReactProps({
        style: expect.objectContaining({ zIndex: 7 }),
      });
    });

    it("should pass inverted to the sticky footer view holder", () => {
      const manager = createMockRecyclerViewManager({
        scrollOffset: 0,
        layouts: createStandardLayouts(),
      });

      const result = renderStickyFooters({ manager, inverted: true });

      expect(result).toContainReactComponent(ViewHolder, {
        index: 9,
        inverted: true,
      });
    });

    it("should render the footer with the StickyFooter target", () => {
      const manager = createMockRecyclerViewManager({
        scrollOffset: 0,
        layouts: createStandardLayouts(),
      });

      const result = renderStickyFooters({ manager });

      expect(result).toContainReactComponent(ViewHolder, {
        target: "StickyFooter",
        index: 9,
      });
    });
  });
});
