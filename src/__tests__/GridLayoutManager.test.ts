import {
  createPopulatedLayoutManager,
  getAllLayouts,
  LayoutManagerType,
  createLayoutParams,
} from "./helpers/createLayoutManager";

describe("GridLayoutManager", () => {
  const windowSize = { width: 400, height: 900 };
  const defaultParams = { windowSize, maxColumns: 2 };

  describe("Basic grid layout", () => {
    it("should arrange items in rows with equal widths", () => {
      const manager = createPopulatedLayoutManager(
        LayoutManagerType.GRID,
        4,
        defaultParams
      );
      const layouts = getAllLayouts(manager);

      expect(layouts[0].x).toBe(0);
      expect(layouts[0].width).toBe(200);
      expect(layouts[1].x).toBe(200);

      expect(layouts[2].y).toBe(layouts[0].height);
      expect(layouts[3].x).toBe(200);
    });

    it("should respect maxColumns configuration", () => {
      const manager = createPopulatedLayoutManager(LayoutManagerType.GRID, 6, {
        ...defaultParams,
        maxColumns: 3,
      });
      const layouts = getAllLayouts(manager);

      expect(layouts[0].width).toBeCloseTo(400 / 3);
      expect(layouts[3].x).toBe(0);
      expect(layouts[3].y).toBe(layouts[0].height);
    });
  });

  describe("Multi-column items", () => {
    it("should handle items spanning multiple columns", () => {
      const manager = createPopulatedLayoutManager(LayoutManagerType.GRID, 3, {
        ...defaultParams,
        maxColumns: 3,
        overrideItemLayout: (index, layout) => {
          layout.span = index === 0 ? 2 : undefined;
        },
      });
      const layouts = getAllLayouts(manager);

      // First item spans 2 columns
      expect(layouts[0].width).toBeCloseTo((400 / 3) * 2);
      // Next item starts in third column
      expect(layouts[1].x).toBeCloseTo((400 / 3) * 2);
    });

    it("should wrap items that exceed column count", () => {
      const manager = createPopulatedLayoutManager(LayoutManagerType.GRID, 4, {
        ...defaultParams,
        overrideItemLayout: (index, layout) => {
          layout.span = index % 2 === 0 ? 2 : 1;
        },
      });
      const layouts = getAllLayouts(manager);

      // Row 1: 2 columns (span 2 + span 2 would exceed 2 columns)
      expect(layouts[0].width).toBe(400);
      expect(layouts[1].x).toBe(0);
      expect(layouts[1].y).toBe(layouts[0].height);
      expect(layouts[2].x).toBe(0);
      expect(layouts[2].y).toBe(layouts[1].height + layouts[0].height);
    });
  });

  describe("Layout recalculations", () => {
    it("should adjust layout when window size changes", () => {
      const manager = createPopulatedLayoutManager(
        LayoutManagerType.GRID,
        4,
        defaultParams
      );

      // Update window size
      manager.updateLayoutParams(
        createLayoutParams({
          ...defaultParams,
          windowSize: { width: 600, height: 900 },
        })
      );

      const updatedWidth = getAllLayouts(manager)[0].width;
      expect(updatedWidth).toBe(300); // 600 / 2 columns
    });

    it("should maintain positions when adding new items", () => {
      const manager = createPopulatedLayoutManager(
        LayoutManagerType.GRID,
        2,
        defaultParams
      );
      const initialLayouts = getAllLayouts(manager);

      // Add two more items
      manager.modifyLayout([], 4);

      const updatedLayouts = getAllLayouts(manager);
      expect(updatedLayouts[0]).toEqual(initialLayouts[0]);
      expect(updatedLayouts[3].y).toBe(initialLayouts[0].height);
    });
  });
});
