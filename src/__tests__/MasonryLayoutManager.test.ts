import { RVLayoutManager } from "../recyclerview/layout-managers/LayoutManager";
import { RVMasonryLayoutManagerImpl } from "../recyclerview/layout-managers/MasonryLayoutManager";

import {
  getAllLayouts,
  LayoutManagerType,
  createLayoutParams,
  createLayoutManager,
  createMockLayoutInfo,
} from "./helpers/createLayoutManager";

describe("MasonryLayoutManager", () => {
  const windowSize = { width: 400, height: 900 };
  const defaultParams = {
    windowSize,
    maxColumns: 2,
    optimizeItemArrangement: true,
  };

  // Helper to get column heights
  const getColumnHeights = (manager: RVLayoutManager): number[] => {
    return (manager as RVMasonryLayoutManagerImpl)["columnHeights"];
  };

  describe("Vertical Masonry Layout", () => {
    it("should distribute items into columns based on height", () => {
      const manager = createLayoutManager(
        LayoutManagerType.MASONRY,
        defaultParams
      );
      const layoutInfos = [
        createMockLayoutInfo(0, 200, 100), // Col 0
        createMockLayoutInfo(1, 200, 150), // Col 1
        createMockLayoutInfo(2, 200, 120), // Col 0 (shorter)
        createMockLayoutInfo(3, 200, 80), // Col 1 (shorter)
        createMockLayoutInfo(4, 200, 200), // Col 0 (shorter)
      ];
      manager.modifyLayout(layoutInfos, 5);
      const layouts = getAllLayouts(manager);

      expect(layouts[0].x).toBe(0);
      expect(layouts[0].y).toBe(0);

      expect(layouts[1].x).toBe(200); // Second column
      expect(layouts[1].y).toBe(0);

      expect(layouts[2].x).toBe(0); // Back to first column
      expect(layouts[2].y).toBe(100); // Below item 0

      expect(layouts[3].x).toBe(200); // Still first column
      expect(layouts[3].y).toBe(150); // Below item 2 (100 + 120)

      expect(layouts[4].x).toBe(0); // Second column
      expect(layouts[4].y).toBe(220); // Below item 1
    });

    it("should respect maxColumns configuration", () => {
      const manager = createLayoutManager(LayoutManagerType.MASONRY, {
        ...defaultParams,
        maxColumns: 3,
      });
      const layoutInfos = [
        createMockLayoutInfo(0, 133, 100), // Col 0
        createMockLayoutInfo(1, 133, 150), // Col 1
        createMockLayoutInfo(2, 133, 120), // Col 2
        createMockLayoutInfo(3, 133, 80), // Col 0
      ];
      manager.modifyLayout(layoutInfos, 4);
      const layouts = getAllLayouts(manager);
      const colWidth = windowSize.width / 3;

      expect(layouts[0].x).toBeCloseTo(0);
      expect(layouts[1].x).toBeCloseTo(colWidth);
      expect(layouts[2].x).toBeCloseTo(colWidth * 2);
      expect(layouts[3].x).toBeCloseTo(0); // Placed in the shortest column (Col 0)
      expect(layouts[3].y).toBeCloseTo(100); // Below item 0
    });

    it("should calculate total layout size correctly", () => {
      const manager = createLayoutManager(
        LayoutManagerType.MASONRY,
        defaultParams
      );
      const layoutInfos = [
        createMockLayoutInfo(0, 200, 100), // Col 0
        createMockLayoutInfo(1, 200, 150), // Col 1
        createMockLayoutInfo(2, 200, 120), // Col 0
      ];
      manager.modifyLayout(layoutInfos, 3);
      const layoutSize = manager.getLayoutSize();

      expect(layoutSize.width).toBe(400);
      // Height is the tallest column height
      const heights = getColumnHeights(manager);
      expect(layoutSize.height).toBeCloseTo(Math.max(...heights)); // Max of [220, 150]
      expect(layoutSize.height).toBeCloseTo(220);
    });
  });

  describe("Layout Modifications", () => {
    it("should update layout when items are added", () => {
      const manager = createLayoutManager(
        LayoutManagerType.MASONRY,
        defaultParams
      );
      const initialInfos = [
        createMockLayoutInfo(0, 200, 100), // Col 0 H=100
        createMockLayoutInfo(1, 200, 150), // Col 1 H=150
      ];
      manager.modifyLayout(initialInfos, 2);
      expect(getAllLayouts(manager).length).toBe(2);
      expect(getColumnHeights(manager)).toEqual([100, 150]);

      // Add item, should go to Col 0
      const newLayoutInfos = [createMockLayoutInfo(2, 200, 120)];
      manager.modifyLayout(newLayoutInfos, 3);

      const layouts = getAllLayouts(manager);
      expect(layouts.length).toBe(3);
      expect(layouts[2].x).toBe(0); // Col 0
      expect(layouts[2].y).toBe(100); // Below item 0
      expect(getColumnHeights(manager)).toEqual([220, 150]); // 100+120, 150
    });

    it("should handle removing items (requires full recalculation)", () => {
      const manager = createLayoutManager(
        LayoutManagerType.MASONRY,
        defaultParams
      );
      const initialInfos = [
        createMockLayoutInfo(0, 200, 100), // Col 0 H=100
        createMockLayoutInfo(1, 200, 150), // Col 1 H=150
        createMockLayoutInfo(2, 200, 120), // Col 0 H=220
      ];
      manager.modifyLayout(initialInfos, 3);
      expect(getColumnHeights(manager)).toEqual([220, 150]);

      // Remove item 2 (from Col 0) - Masonry usually recalculates fully
      // We simulate this by passing the remaining items
      const remainingInfos = [
        createMockLayoutInfo(0, 200, 100),
        createMockLayoutInfo(1, 200, 150),
      ];
      manager.modifyLayout(remainingInfos, 2);

      const layouts = getAllLayouts(manager);
      expect(layouts.length).toBe(2);
      expect(getColumnHeights(manager)).toEqual([100, 150]); // Back to original state
    });

    it("should recalculate layout when window size changes", () => {
      const manager = createLayoutManager(
        LayoutManagerType.MASONRY,
        defaultParams
      );
      const initialInfos = [
        createMockLayoutInfo(0, 200, 100), // Col 0
        createMockLayoutInfo(1, 200, 150), // Col 1
        createMockLayoutInfo(2, 200, 120), // Col 0
      ];
      manager.modifyLayout(initialInfos, 3);
      const initialLayouts = getAllLayouts(manager);
      expect(initialLayouts[1].x).toBe(200);

      // Change window size and columns
      manager.updateLayoutParams(
        createLayoutParams({
          ...defaultParams,
          maxColumns: 3,
          windowSize: { width: 600, height: 900 },
        })
      );
      // modifyLayout needs to be called again as dimensions depend on width
      const updatedInfos = [
        createMockLayoutInfo(0, 200, 100), // New width = 600/3 = 200
        createMockLayoutInfo(1, 200, 150),
        createMockLayoutInfo(2, 200, 120),
      ];
      manager.modifyLayout(updatedInfos, 3);

      const updatedLayouts = getAllLayouts(manager);
      expect(updatedLayouts[0].width).toBe(200);
      expect(updatedLayouts[1].x).toBe(200); // Col 1 starts at 200
      expect(updatedLayouts[2].x).toBe(400); // Col 2 starts at 400
      expect(getColumnHeights(manager)).toEqual([100, 150, 120]);
    });
  });

  describe("Visible Layouts in Masonry", () => {
    it("should find all visible items when y-positions are not sorted by index", () => {
      // With optimizeItemArrangement=false and 2 columns, items are placed
      // sequentially: item 0 in col 0, item 1 in col 1, item 2 in col 0, etc.
      // When column heights diverge, y-positions are NOT sorted by index,
      // which broke the binary search in the base class.
      const manager = createLayoutManager(LayoutManagerType.MASONRY, {
        ...defaultParams,
        optimizeItemArrangement: false,
      });

      // Create items with varying heights to create column height divergence
      // Col 0: items 0 (h=300), 2 (h=100), 4 (h=100) -> y: 0, 300, 400
      // Col 1: items 1 (h=50),  3 (h=50),  5 (h=50)  -> y: 0, 50, 100
      const layoutInfos = [
        createMockLayoutInfo(0, 200, 300), // Col 0, y=0
        createMockLayoutInfo(1, 200, 50), // Col 1, y=0
        createMockLayoutInfo(2, 200, 100), // Col 0, y=300
        createMockLayoutInfo(3, 200, 50), // Col 1, y=50
        createMockLayoutInfo(4, 200, 100), // Col 0, y=400
        createMockLayoutInfo(5, 200, 50), // Col 1, y=100
      ];
      manager.modifyLayout(layoutInfos, 6);
      const layouts = getAllLayouts(manager);

      // Verify the unsorted y-positions by index
      // Items by index: y = [0, 0, 300, 50, 400, 100]
      expect(layouts[0].y).toBe(0);
      expect(layouts[1].y).toBe(0);
      expect(layouts[2].y).toBe(300);
      expect(layouts[3].y).toBe(50);
      expect(layouts[4].y).toBe(400);
      expect(layouts[5].y).toBe(100);

      // Viewport from y=40 to y=110 should include items at:
      // - Item 1: y=0, h=50 -> ends at 50 > 40 ✓, starts at 0 < 110 ✓
      // - Item 3: y=50, h=50 -> ends at 100 > 40 ✓, starts at 50 < 110 ✓
      // - Item 5: y=100, h=50 -> ends at 150 > 40 ✓, starts at 100 < 110 ✓
      const visible = manager.getVisibleLayouts(40, 110);
      // Must include items 1, 3, and 5 (all in viewport)
      expect(visible.includes(1)).toBe(true);
      expect(visible.includes(3)).toBe(true);
      expect(visible.includes(5)).toBe(true);
    });

    it("should handle viewport that only sees one column", () => {
      const manager = createLayoutManager(LayoutManagerType.MASONRY, {
        ...defaultParams,
        optimizeItemArrangement: false,
      });

      // Col 0: item 0 (h=50), item 2 (h=50) -> y: 0, 50
      // Col 1: item 1 (h=300), item 3 (h=50) -> y: 0, 300
      const layoutInfos = [
        createMockLayoutInfo(0, 200, 50), // Col 0, y=0
        createMockLayoutInfo(1, 200, 300), // Col 1, y=0
        createMockLayoutInfo(2, 200, 50), // Col 0, y=50
        createMockLayoutInfo(3, 200, 50), // Col 1, y=300
      ];
      manager.modifyLayout(layoutInfos, 4);

      // Viewport from y=60 to y=120: only item 1 (y=0, h=300) is visible
      // Item 0: y=0, h=50, ends at 50 < 60 -> NOT visible
      // Item 1: y=0, h=300, ends at 300 > 60, starts at 0 < 120 -> visible
      // Item 2: y=50, h=50, ends at 100 > 60, starts at 50 < 120 -> visible
      // Item 3: y=300, h=50, starts at 300 > 120 -> NOT visible
      const visible = manager.getVisibleLayouts(60, 120);
      expect(visible.includes(1)).toBe(true);
      expect(visible.includes(2)).toBe(true);
    });
  });

  describe("Empty Layout", () => {
    it("should return zero size for empty layout", () => {
      const manager = createLayoutManager(
        LayoutManagerType.MASONRY,
        defaultParams
      );
      manager.modifyLayout([], 0);
      const layoutSize = manager.getLayoutSize();
      expect(layoutSize.width).toBe(0);
      expect(layoutSize.height).toBe(0);
      expect(getAllLayouts(manager).length).toBe(0);
    });
  });
});
