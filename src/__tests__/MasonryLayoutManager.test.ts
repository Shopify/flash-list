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

    it("should keep visible appended items inside the engaged range", () => {
      const manager = createLayoutManager(LayoutManagerType.MASONRY, {
        windowSize: { width: 400, height: 500 },
        maxColumns: 2,
        optimizeItemArrangement: true,
      });
      const firstPageHeights = [
        371, 99, 281, 497, 327, 191, 89, 441, 407, 407, 441, 89, 191, 327, 497,
        281, 99, 371,
      ];
      manager.modifyLayout(
        firstPageHeights.map((height, index) =>
          createMockLayoutInfo(index, 200, height)
        ),
        firstPageHeights.length
      );

      const appendedHeights = [
        257, 177, 131, 119, 141, 197, 287, 411, 149, 341, 147, 407,
      ];
      manager.modifyLayout(
        appendedHeights.map((height, index) =>
          createMockLayoutInfo(firstPageHeights.length + index, 200, height)
        ),
        firstPageHeights.length + appendedHeights.length
      );

      const viewportStart = 3600;
      const viewportEnd = 4100;
      const engaged = manager.getVisibleLayouts(viewportStart, viewportEnd);
      const layouts = getAllLayouts(manager);
      expect(layouts[25]).toEqual(
        expect.objectContaining({ x: 200, y: 3292, height: 411 })
      );
      const actuallyVisibleIndices = layouts
        .map((layout, index) => ({ index, layout }))
        .filter(
          ({ layout }) =>
            layout.y < viewportEnd && layout.y + layout.height > viewportStart
        )
        .map(({ index }) => index);
      const missingVisibleIndices = actuallyVisibleIndices.filter(
        (index) => !engaged.includes(index)
      );

      expect({
        engaged: engaged.toArray(),
        actuallyVisibleIndices,
        missingVisibleIndices,
      }).toEqual({
        engaged: expect.arrayContaining(actuallyVisibleIndices),
        actuallyVisibleIndices: [25, 27, 28, 29],
        missingVisibleIndices: [],
      });
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
