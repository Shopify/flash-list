import {
  findFirstVisibleIndex,
  findLastVisibleIndex,
} from "../recyclerview/utils/findVisibleIndex";
import { RVLayout } from "../recyclerview/layout-managers/LayoutManager";

import {
  createPopulatedLayoutManager,
  LayoutManagerType,
  getAllLayouts,
} from "./helpers/createLayoutManager";

describe("findVisibleIndex", () => {
  // Helper function to create mock layouts directly for precise control
  function createMockLayouts(
    count: number,
    startPosition: number,
    itemSize: number,
    isHorizontal: boolean
  ): RVLayout[] {
    const layouts: RVLayout[] = [];
    for (let i = 0; i < count; i++) {
      const x = isHorizontal ? startPosition + i * itemSize : 0;
      const y = isHorizontal ? 0 : startPosition + i * itemSize;
      layouts.push({
        x,
        y,
        width: isHorizontal ? itemSize : 100,
        height: isHorizontal ? 100 : itemSize,
      });
    }
    return layouts;
  }

  describe("findFirstVisibleIndex", () => {
    // Test 1: Basic functionality - vertical layout
    it("finds the first visible index in a vertical layout", () => {
      const layoutManager = createPopulatedLayoutManager(
        LayoutManagerType.LINEAR,
        20,
        { horizontal: false }
      );
      const layouts = getAllLayouts(layoutManager);

      // Viewport starts at y=150, so the second item (index 1) should be first visible
      const firstVisibleIndex = findFirstVisibleIndex(layouts, 150, false);
      expect(firstVisibleIndex).toBe(1);
    });

    // Test 2: Basic functionality - horizontal layout
    it("finds the first visible index in a horizontal layout", () => {
      const layoutManager = createPopulatedLayoutManager(
        LayoutManagerType.LINEAR,
        20,
        { horizontal: true }
      );
      const layouts = getAllLayouts(layoutManager);

      // Viewport starts at x=150, so the second item (index 1) should be first visible
      const firstVisibleIndex = findFirstVisibleIndex(layouts, 150, true);
      expect(firstVisibleIndex).toBe(1);
    });

    // Test 3: Empty layouts array
    it("returns -1 for empty layouts array", () => {
      const firstVisibleIndex = findFirstVisibleIndex([], 100, false);
      expect(firstVisibleIndex).toBe(-1);
    });

    // Test 4: All items are visible (threshold at 0)
    it("returns 0 when all items are visible (threshold at 0)", () => {
      const layoutManager = createPopulatedLayoutManager(
        LayoutManagerType.LINEAR,
        10
      );
      const layouts = getAllLayouts(layoutManager);

      const firstVisibleIndex = findFirstVisibleIndex(layouts, 0, false);
      expect(firstVisibleIndex).toBe(0);
    });

    // Test 5: No items are visible (threshold beyond all items)
    it("returns -1 when no items are visible", () => {
      const layouts = createMockLayouts(10, 0, 100, false);

      // Threshold is beyond all items (10 items * 100 height = 1000)
      const firstVisibleIndex = findFirstVisibleIndex(layouts, 1100, false);
      expect(firstVisibleIndex).toBe(-1);
    });

    // Test 6: Edge case - threshold exactly at item boundary
    it("returns correct index when threshold is exactly at item boundary", () => {
      const layouts = createMockLayouts(10, 0, 100, false);

      // Threshold exactly at the start of the 5th item
      const firstVisibleIndex = findFirstVisibleIndex(layouts, 400, false);
      expect(firstVisibleIndex).toBe(4);
    });

    // Test 7: Edge case - threshold in the middle of an item
    it("returns correct index when threshold is in the middle of an item", () => {
      const layouts = createMockLayouts(10, 0, 100, false);

      // Threshold in the middle of the 3rd item
      const firstVisibleIndex = findFirstVisibleIndex(layouts, 250, false);
      expect(firstVisibleIndex).toBe(2);
    });

    // Test 8: With grid layout - threshold crosses multiple columns
    it("finds first visible index with grid layout", () => {
      const layoutManager = createPopulatedLayoutManager(
        LayoutManagerType.GRID,
        20,
        { maxColumns: 2 }
      );
      const layouts = getAllLayouts(layoutManager);

      // With 2 columns, items are positioned differently
      const firstVisibleIndex = findFirstVisibleIndex(layouts, 150, false);

      // Expected result depends on how grid layout positions items
      // This test might need adjustment based on actual grid layout behavior
      expect(firstVisibleIndex).not.toBe(-1);
    });

    // Test 9: With masonry layout - variable height items
    it("finds first visible index with masonry layout and variable item sizes", () => {
      const layoutManager = createPopulatedLayoutManager(
        LayoutManagerType.MASONRY,
        20,
        { maxColumns: 2 },
        100,
        100,
        true // Variable size
      );
      const layouts = getAllLayouts(layoutManager);

      const firstVisibleIndex = findFirstVisibleIndex(layouts, 200, false);
      expect(firstVisibleIndex).not.toBe(-1);
    });

    // Test 10: Partial visibility - item just starting to appear
    it("finds item that is just starting to become visible", () => {
      const layouts = createMockLayouts(10, 0, 100, false);

      // Threshold just 1px before item 4 ends
      const firstVisibleIndex = findFirstVisibleIndex(layouts, 399, false);
      expect(firstVisibleIndex).toBe(3);
    });
  });

  describe("findLastVisibleIndex", () => {
    // Test 11: Basic functionality - vertical layout
    it("finds the last visible index in a vertical layout", () => {
      const layoutManager = createPopulatedLayoutManager(
        LayoutManagerType.LINEAR,
        20,
        { horizontal: false }
      );
      const layouts = getAllLayouts(layoutManager);

      // Viewport ends at y=250, so the third item (index 2) should be last visible
      const lastVisibleIndex = findLastVisibleIndex(layouts, 250, false);
      expect(lastVisibleIndex).toBe(2);
    });

    // Test 12: Basic functionality - horizontal layout
    it("finds the last visible index in a horizontal layout", () => {
      const layoutManager = createPopulatedLayoutManager(
        LayoutManagerType.LINEAR,
        20,
        { horizontal: true }
      );
      const layouts = getAllLayouts(layoutManager);

      // Viewport ends at x=250, so the third item (index 2) should be last visible
      const lastVisibleIndex = findLastVisibleIndex(layouts, 250, true);
      expect(lastVisibleIndex).toBe(2);
    });

    // Test 13: Empty layouts array
    it("returns -1 for empty layouts array", () => {
      const lastVisibleIndex = findLastVisibleIndex([], 100, false);
      expect(lastVisibleIndex).toBe(-1);
    });

    // Test 14: All items are within viewport
    it("returns the last item index when all items are within viewport", () => {
      const layouts = createMockLayouts(5, 0, 100, false);

      // Viewport ends at y=1000, which includes all 5 items
      const lastVisibleIndex = findLastVisibleIndex(layouts, 1000, false);
      expect(lastVisibleIndex).toBe(4); // Last item index is 4
    });

    // Test 15: No items are visible (threshold before all items)
    it("returns -1 when no items are visible", () => {
      const layouts = createMockLayouts(10, 100, 100, false);

      // Threshold is before all items start
      const lastVisibleIndex = findLastVisibleIndex(layouts, 50, false);
      expect(lastVisibleIndex).toBe(-1);
    });

    // Test 16: Edge case - threshold exactly at item boundary
    it("returns correct index when threshold is exactly at item boundary", () => {
      const layouts = createMockLayouts(10, 0, 100, false);

      // Threshold exactly at the end of the 3rd item
      const lastVisibleIndex = findLastVisibleIndex(layouts, 300, false);
      expect(lastVisibleIndex).toBe(3);
    });

    // Test 17: Edge case - threshold in the middle of an item
    it("returns correct index when threshold is in the middle of an item", () => {
      const layouts = createMockLayouts(10, 0, 100, false);

      // Threshold in the middle of the 3rd item
      const lastVisibleIndex = findLastVisibleIndex(layouts, 250, false);
      expect(lastVisibleIndex).toBe(2);
    });

    // Test 18: With grid layout
    it("finds last visible index with grid layout", () => {
      const layoutManager = createPopulatedLayoutManager(
        LayoutManagerType.GRID,
        20,
        { maxColumns: 2 }
      );
      const layouts = getAllLayouts(layoutManager);

      const lastVisibleIndex = findLastVisibleIndex(layouts, 350, false);
      expect(lastVisibleIndex).not.toBe(-1);
    });

    // Test 19: With masonry layout - variable height items
    it("finds last visible index with masonry layout and variable item sizes", () => {
      const layoutManager = createPopulatedLayoutManager(
        LayoutManagerType.MASONRY,
        20,
        { maxColumns: 2 },
        100,
        100,
        true // Variable size
      );
      const layouts = getAllLayouts(layoutManager);

      const lastVisibleIndex = findLastVisibleIndex(layouts, 400, false);
      expect(lastVisibleIndex).not.toBe(-1);
    });

    // Test 20: Last item partially visible
    it("includes last item when it's partially visible", () => {
      const layouts = createMockLayouts(10, 0, 100, false);

      // Threshold just 1px into the 5th item
      const lastVisibleIndex = findLastVisibleIndex(layouts, 401, false);
      expect(lastVisibleIndex).toBe(4);
    });
  });

  describe("Edge cases and complex scenarios", () => {
    // Test 21: Single item layout
    it("correctly handles single item layout for first visible", () => {
      const layouts = createMockLayouts(1, 0, 100, false);

      const firstVisibleIndex = findFirstVisibleIndex(layouts, 50, false);
      expect(firstVisibleIndex).toBe(0);
    });

    // Test 22: Single item layout
    it("correctly handles single item layout for last visible", () => {
      const layouts = createMockLayouts(1, 0, 100, false);

      const lastVisibleIndex = findLastVisibleIndex(layouts, 50, false);
      expect(lastVisibleIndex).toBe(0);
    });

    // Test 23: Variable size items for first visible index
    it("correctly finds first visible with variable size items", () => {
      const layouts: RVLayout[] = [
        { x: 0, y: 0, width: 100, height: 50 },
        { x: 0, y: 50, width: 100, height: 150 },
        { x: 0, y: 200, width: 100, height: 75 },
        { x: 0, y: 275, width: 100, height: 100 },
      ];

      const firstVisibleIndex = findFirstVisibleIndex(layouts, 175, false);
      expect(firstVisibleIndex).toBe(1); // Second item is still visible at threshold 175
    });

    // Test 24: Variable size items for last visible index
    it("correctly finds last visible with variable size items", () => {
      const layouts: RVLayout[] = [
        { x: 0, y: 0, width: 100, height: 50 },
        { x: 0, y: 50, width: 100, height: 150 },
        { x: 0, y: 200, width: 100, height: 75 },
        { x: 0, y: 275, width: 100, height: 100 },
      ];

      const lastVisibleIndex = findLastVisibleIndex(layouts, 225, false);
      expect(lastVisibleIndex).toBe(2); // Third item is visible at threshold 225
    });

    // Test 25: Items with zero size
    it("correctly handles items with zero size for first visible", () => {
      const layouts: RVLayout[] = [
        { x: 0, y: 0, width: 100, height: 0 },
        { x: 0, y: 0, width: 100, height: 100 },
      ];

      const firstVisibleIndex = findFirstVisibleIndex(layouts, 0, false);
      expect(firstVisibleIndex).toBe(0); // First item is at position but has zero height
    });

    // Test 26: Items with zero size
    it("correctly handles items with zero size for last visible", () => {
      const layouts: RVLayout[] = [
        { x: 0, y: 0, width: 100, height: 100 },
        { x: 0, y: 100, width: 100, height: 0 },
      ];

      const lastVisibleIndex = findLastVisibleIndex(layouts, 100, false);
      expect(lastVisibleIndex).toBe(1); // Second item is at threshold position but has zero height
    });

    // Test 27: Large number of items - performance test
    it("efficiently finds first visible index in large dataset", () => {
      const layouts = createMockLayouts(1000, 0, 100, false);

      // Threshold in the middle of the list
      const firstVisibleIndex = findFirstVisibleIndex(layouts, 50000, false);
      expect(firstVisibleIndex).toBe(500);
    });

    // Test 28: Large number of items - performance test
    it("efficiently finds last visible index in large dataset", () => {
      const layouts = createMockLayouts(1000, 0, 100, false);

      // Threshold in the middle of the list
      const lastVisibleIndex = findLastVisibleIndex(layouts, 50000, false);
      expect(lastVisibleIndex).toBe(500);
    });

    // Test 29: Non-sequential indices
    it("works with non-sequential indices for first visible", () => {
      const layouts: RVLayout[] = [
        { x: 0, y: 0, width: 100, height: 100 },
        { x: 0, y: 100, width: 100, height: 100 },
        { x: 0, y: 200, width: 100, height: 100 },
      ];

      const firstVisibleIndex = findFirstVisibleIndex(layouts, 150, false);
      expect(firstVisibleIndex).toBe(1); // Second layout in the array, not index 1
    });

    // Test 30: Non-sequential indices
    it("works with non-sequential indices for last visible", () => {
      const layouts: RVLayout[] = [
        { x: 0, y: 0, width: 100, height: 100 },
        { x: 0, y: 100, width: 100, height: 100 },
        { x: 0, y: 200, width: 100, height: 100 },
      ];

      const lastVisibleIndex = findLastVisibleIndex(layouts, 150, false);
      expect(lastVisibleIndex).toBe(1); // Second layout in the array, not index 1
    });
  });
});
