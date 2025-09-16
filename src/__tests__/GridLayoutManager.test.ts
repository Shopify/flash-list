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

  describe("Separator behavior", () => {
    it("should mark last row items to skip separators in 2x2 grid", () => {
      const manager = createPopulatedLayoutManager(
        LayoutManagerType.GRID,
        4,
        defaultParams
      );
      const layouts = getAllLayouts(manager);

      // First row items should not skip separators
      expect(layouts[0].skipSeparator).toBeFalsy();
      expect(layouts[1].skipSeparator).toBeFalsy();

      // Last row items should skip separators
      expect(layouts[2].skipSeparator).toBe(true);
      expect(layouts[3].skipSeparator).toBe(true);
    });

    it("should mark last row items to skip separators in 3x3 grid", () => {
      const manager = createPopulatedLayoutManager(LayoutManagerType.GRID, 6, {
        ...defaultParams,
        maxColumns: 3,
      });
      const layouts = getAllLayouts(manager);

      // First row items should not skip separators
      expect(layouts[0].skipSeparator).toBeFalsy();
      expect(layouts[1].skipSeparator).toBeFalsy();
      expect(layouts[2].skipSeparator).toBeFalsy();

      // Last row items should skip separators
      expect(layouts[3].skipSeparator).toBe(true);
      expect(layouts[4].skipSeparator).toBe(true);
      expect(layouts[5].skipSeparator).toBe(true);
    });

    it("should mark last row items to skip separators with uneven rows", () => {
      const manager = createPopulatedLayoutManager(
        LayoutManagerType.GRID,
        5,
        defaultParams
      );
      const layouts = getAllLayouts(manager);

      // First two rows should not skip separators
      expect(layouts[0].skipSeparator).toBeFalsy();
      expect(layouts[1].skipSeparator).toBeFalsy();
      expect(layouts[2].skipSeparator).toBeFalsy();
      expect(layouts[3].skipSeparator).toBeFalsy();

      // Last row (single item) should skip separator
      expect(layouts[4].skipSeparator).toBe(true);
    });

    it("should handle single item grid", () => {
      const manager = createPopulatedLayoutManager(
        LayoutManagerType.GRID,
        1,
        defaultParams
      );
      const layouts = getAllLayouts(manager);

      // Single item should skip separator
      expect(layouts[0].skipSeparator).toBe(true);
    });

    it("should update skipSeparator when items are added dynamically", () => {
      const manager = createPopulatedLayoutManager(
        LayoutManagerType.GRID,
        2,
        defaultParams
      );
      let layouts = getAllLayouts(manager);

      // Initially, both items are in last row
      expect(layouts[0].skipSeparator).toBe(true);
      expect(layouts[1].skipSeparator).toBe(true);

      // Add two more items to complete the grid
      manager.modifyLayout([], 4);
      layouts = getAllLayouts(manager);

      // First row should not skip separators anymore
      expect(layouts[0].skipSeparator).toBeFalsy();
      expect(layouts[1].skipSeparator).toBeFalsy();

      // New last row should skip separators
      expect(layouts[2].skipSeparator).toBe(true);
      expect(layouts[3].skipSeparator).toBe(true);
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

  describe("Performance calculations", () => {
    it("should avoid scanning all items during width updates", () => {
      const manager = createPopulatedLayoutManager(
        LayoutManagerType.GRID,
        1000, // Large number of items
        defaultParams
      );

      // Measure time for layout parameter updates
      const startTime = performance.now();
      manager.updateLayoutParams(
        createLayoutParams({
          ...defaultParams,
          windowSize: { width: 600, height: 900 },
        })
      );
      const endTime = performance.now();
      const updateTime = endTime - startTime;

      // Should complete quickly even with 1000 items
      expect(updateTime).toBeLessThan(50); // 50ms threshold
    });

    it("should use lazy width calculation for better performance", () => {
      const manager = createPopulatedLayoutManager(
        LayoutManagerType.GRID,
        500,
        defaultParams
      );

      // Force width recalculation by changing window size
      manager.updateLayoutParams(
        createLayoutParams({
          ...defaultParams,
          windowSize: { width: 800, height: 900 },
        })
      );

      // Measure time for layout computation of a subset
      const startTime = performance.now();
      manager.recomputeLayouts(0, 50); // Only compute first 50 items
      const endTime = performance.now();
      const computeTime = endTime - startTime;

      // Should be fast since we're only computing 50 items, not all 500
      expect(computeTime).toBeLessThan(20); // 20ms threshold
    });

    it("should efficiently handle separator status updates", () => {
      const manager = createPopulatedLayoutManager(
        LayoutManagerType.GRID,
        1000,
        { ...defaultParams, maxColumns: 4 }
      );

      // Measure time for adding items (which triggers separator updates)
      const startTime = performance.now();
      manager.modifyLayout([], 1004); // Add 4 more items
      const endTime = performance.now();
      const modifyTime = endTime - startTime;

      // Should complete quickly due to optimized separator handling
      expect(modifyTime).toBeLessThan(30); // 30ms threshold

      // Verify separator status is correct
      const layouts = getAllLayouts(manager);
      const lastRowStart = layouts.length - (layouts.length % 4 || 4);

      // Last row items should skip separators
      for (let i = lastRowStart; i < layouts.length; i++) {
        expect(layouts[i].skipSeparator).toBe(true);
      }

      // Previous row items should not skip separators
      if (lastRowStart > 0) {
        expect(layouts[lastRowStart - 1].skipSeparator).toBeFalsy();
      }
    });

    it("should maintain O(k) complexity for partial layout updates", () => {
      const manager = createPopulatedLayoutManager(
        LayoutManagerType.GRID,
        2000,
        defaultParams
      );

      // Measure time for partial recomputation
      const startTime = performance.now();
      manager.recomputeLayouts(100, 200); // Recompute 100 items
      const endTime = performance.now();
      const partialTime = endTime - startTime;

      // Now measure time for larger partial recomputation
      const startTime2 = performance.now();
      manager.recomputeLayouts(100, 400); // Recompute 300 items
      const endTime2 = performance.now();
      const largerPartialTime = endTime2 - startTime2;

      // Time should scale roughly linearly with the number of items processed
      // Handle cases where operations are too fast to measure accurately
      if (partialTime > 0) {
        const ratio = largerPartialTime / partialTime;
        expect(ratio).toBeLessThan(10); // Allow more variance for fast operations
      }

      // Absolute threshold - operations should complete quickly
      expect(largerPartialTime).toBeLessThan(100); // Increased threshold for reliability
    });
  });
});
