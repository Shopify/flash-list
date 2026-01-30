import React, { createRef } from "react";
import { Text, View } from "react-native";
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
      x: 0,
      y: 0,
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

const Separator = () => <View testID="separator" />;

const renderRecyclerView = (args: {
  numColumns?: number;
  masonry?: boolean;
  horizontal?: boolean;
  ref?: React.Ref<FlashListRef<number>>;
  data?: number[];
  ItemSeparatorComponent?: React.ComponentType<any>;
}) => {
  const {
    numColumns = 1,
    masonry = false,
    horizontal = false,
    ref,
    data,
    ItemSeparatorComponent,
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
      ItemSeparatorComponent={ItemSeparatorComponent}
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

  describe("ItemSeparatorComponent with numColumns", () => {
    it("should not render separator on second-to-last item with numColumns=2 and 5 items", () => {
      // With numColumns=2 and 5 items:
      // Row 0: items 0, 1
      // Row 1: items 2, 3
      // Row 2: item 4
      // Separators should only appear after items 1 and 3 (end of rows), not after item 3 (second-to-last)
      const result = renderRecyclerView({
        numColumns: 2,
        data: [0, 1, 2, 3, 4],
        ItemSeparatorComponent: Separator,
      });

      // Get all separator components
      const separators = result.findAll("View", { testID: "separator" });
      
      // With 5 items and 2 columns, we have 3 rows (0-1, 2-3, 4)
      // Separators should appear after row 0 (after item 1) and row 1 (after item 3)
      // That's 2 separators total
      expect(separators).toHaveLength(2);
    });

    it("should render correct number of separators with numColumns=2 and 6 items", () => {
      // With numColumns=2 and 6 items:
      // Row 0: items 0, 1
      // Row 1: items 2, 3
      // Row 2: items 4, 5
      // Separators should appear after items 1 and 3 (2 separators)
      const result = renderRecyclerView({
        numColumns: 2,
        data: [0, 1, 2, 3, 4, 5],
        ItemSeparatorComponent: Separator,
      });

      const separators = result.findAll("View", { testID: "separator" });
      
      // With 6 items and 2 columns, we have 3 complete rows
      // Separators should appear after row 0 and row 1 (2 separators)
      expect(separators).toHaveLength(2);
    });

    it("should render separators correctly with numColumns=1", () => {
      // With numColumns=1, every item except the last should have a separator
      const result = renderRecyclerView({
        numColumns: 1,
        data: [0, 1, 2, 3, 4],
        ItemSeparatorComponent: Separator,
      });

      const separators = result.findAll("View", { testID: "separator" });
      
      // With 5 items and 1 column, we should have 4 separators (between each item)
      expect(separators).toHaveLength(4);
    });

    it("should render separators correctly with numColumns=3", () => {
      // With numColumns=3 and 7 items:
      // Row 0: items 0, 1, 2
      // Row 1: items 3, 4, 5
      // Row 2: item 6
      // Separators should appear after items 2 and 5 (2 separators)
      const result = renderRecyclerView({
        numColumns: 3,
        data: [0, 1, 2, 3, 4, 5, 6],
        ItemSeparatorComponent: Separator,
      });

      const separators = result.findAll("View", { testID: "separator" });
      
      // With 7 items and 3 columns, we have 3 rows
      // Separators should appear after row 0 and row 1 (2 separators)
      expect(separators).toHaveLength(2);
    });
  });
});
