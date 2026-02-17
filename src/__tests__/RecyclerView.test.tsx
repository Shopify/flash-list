import React, { createRef } from "react";
import { Text } from "react-native";
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
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
            18, 19,
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const scrollable = root.findWhere((node: any) => node.props.onScroll);
      if (!scrollable) throw new Error("Could not find scrollable component");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
});
