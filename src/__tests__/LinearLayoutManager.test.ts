import {
  createPopulatedLayoutManager,
  getAllLayouts,
  LayoutManagerType,
  createLayoutParams,
  createLayoutManager,
  createMockLayoutInfo,
} from "./helpers/createLayoutManager";

describe("LinearLayoutManager", () => {
  const windowSize = { width: 400, height: 900 };
  const defaultParams = { windowSize, horizontal: false };
  const horizontalParams = { windowSize, horizontal: true };

  describe("Vertical layout", () => {
    it("should stack items vertically", () => {
      const manager = createPopulatedLayoutManager(
        LayoutManagerType.LINEAR,
        3,
        defaultParams,
        100, // itemWidth
        100 // itemHeight
      );
      const layouts = getAllLayouts(manager);

      expect(layouts.length).toBe(3);
      expect(layouts[0].y).toBe(0);
      expect(layouts[1].y).toBe(100);
      expect(layouts[2].y).toBe(200);
      expect(layouts[0].x).toBe(0);
      expect(layouts[0].width).toBe(400); // Should take full width
    });

    it("should handle variable item heights", () => {
      const manager = createLayoutManager(
        LayoutManagerType.LINEAR,
        defaultParams
      );
      const layoutInfos = [
        createMockLayoutInfo(0, 400, 100),
        createMockLayoutInfo(1, 400, 150),
        createMockLayoutInfo(2, 400, 50),
      ];
      manager.modifyLayout(layoutInfos, 3);
      const layouts = getAllLayouts(manager);

      expect(layouts[0].height).toBe(100);
      expect(layouts[1].height).toBe(150);
      expect(layouts[2].height).toBe(50);

      expect(layouts[0].y).toBe(0);
      expect(layouts[1].y).toBe(100); // 0 + 100
      expect(layouts[2].y).toBe(250); // 100 + 150
    });

    it("should calculate total layout size correctly", () => {
      const manager = createPopulatedLayoutManager(
        LayoutManagerType.LINEAR,
        3,
        defaultParams,
        100,
        100
      );
      const layoutSize = manager.getLayoutSize();
      expect(layoutSize.width).toBe(400);
      expect(layoutSize.height).toBe(300); // 3 items * 100 height
    });
  });

  describe("Horizontal layout", () => {
    it("should stack items horizontally", () => {
      const manager = createPopulatedLayoutManager(
        LayoutManagerType.LINEAR,
        3,
        horizontalParams,
        100, // itemWidth
        100 // itemHeight - should take full height
      );
      const layouts = getAllLayouts(manager);

      expect(layouts.length).toBe(3);
      expect(layouts[0].x).toBe(0);
      expect(layouts[1].x).toBe(100);
      expect(layouts[2].x).toBe(200);
      expect(layouts[0].y).toBe(0);
      expect(layouts[0].minHeight).toBe(900); // Should take full height
    });

    it("should handle variable item widths", () => {
      const manager = createLayoutManager(
        LayoutManagerType.LINEAR,
        horizontalParams
      );
      const layoutInfos = [
        createMockLayoutInfo(0, 100, 900),
        createMockLayoutInfo(1, 150, 900),
        createMockLayoutInfo(2, 50, 900),
      ];
      manager.modifyLayout(layoutInfos, 3);
      const layouts = getAllLayouts(manager);

      expect(layouts[0].width).toBe(100);
      expect(layouts[1].width).toBe(150);
      expect(layouts[2].width).toBe(50);

      expect(layouts[0].x).toBe(0);
      expect(layouts[1].x).toBe(100); // 0 + 100
      expect(layouts[2].x).toBe(250); // 100 + 150
    });

    it("should calculate total layout size correctly in horizontal mode", () => {
      const manager = createPopulatedLayoutManager(
        LayoutManagerType.LINEAR,
        3,
        horizontalParams,
        100,
        100
      );
      const layoutSize = manager.getLayoutSize();
      expect(layoutSize.width).toBe(300); // 3 items * 100 width
      expect(layoutSize.height).toBe(900);
    });
  });

  describe("Layout modifications", () => {
    it("should update layout when items are added", () => {
      const manager = createPopulatedLayoutManager(
        LayoutManagerType.LINEAR,
        2,
        defaultParams,
        100,
        100
      );
      const initialLayouts = getAllLayouts(manager);
      expect(initialLayouts.length).toBe(2);

      // Add one more item
      const newLayoutInfo = [createMockLayoutInfo(2, 400, 120)];
      manager.modifyLayout(newLayoutInfo, 3);

      const updatedLayouts = getAllLayouts(manager);
      expect(updatedLayouts.length).toBe(3);
      expect(updatedLayouts[2].y).toBe(200); // 100 + 100
      expect(updatedLayouts[2].height).toBe(120);
      expect(manager.getLayoutSize().height).toBe(320); // 100 + 100 + 120
    });

    it("should update layout when items are removed", () => {
      const manager = createPopulatedLayoutManager(
        LayoutManagerType.LINEAR,
        3,
        defaultParams,
        100,
        100
      );
      expect(getAllLayouts(manager).length).toBe(3);
      expect(manager.getLayoutSize().height).toBe(300);

      // Remove the last item
      manager.modifyLayout([], 2);

      const updatedLayouts = getAllLayouts(manager);
      expect(updatedLayouts.length).toBe(2);
      expect(manager.getLayoutSize().height).toBe(200);
    });

    it("should handle replacing all items", () => {
      const manager = createPopulatedLayoutManager(
        LayoutManagerType.LINEAR,
        3,
        defaultParams,
        100,
        100
      );

      const newLayoutInfos = [
        createMockLayoutInfo(0, 400, 50),
        createMockLayoutInfo(1, 400, 60),
      ];
      manager.modifyLayout(newLayoutInfos, 2);

      const layouts = getAllLayouts(manager);
      expect(layouts.length).toBe(2);
      expect(layouts[0].height).toBe(50);
      expect(layouts[1].height).toBe(60);
      expect(layouts[1].y).toBe(50);
      expect(manager.getLayoutSize().height).toBe(110); // 50 + 60
    });

    it("should recalculate layout when window size changes", () => {
      const manager = createPopulatedLayoutManager(
        LayoutManagerType.LINEAR,
        3,
        defaultParams,
        100,
        100
      );
      const initialLayouts = getAllLayouts(manager);
      expect(initialLayouts[0].width).toBe(400);

      manager.updateLayoutParams(
        createLayoutParams({
          ...defaultParams,
          windowSize: { width: 600, height: 900 },
        })
      );

      const updatedLayouts = getAllLayouts(manager);
      expect(updatedLayouts[0].width).toBe(600); // Width should adapt
      expect(updatedLayouts[1].y).toBe(initialLayouts[1].y); // Vertical position shouldn't change
    });
  });

  describe("Empty layout", () => {
    it("should return zero size for empty layout", () => {
      const manager = createLayoutManager(
        LayoutManagerType.LINEAR,
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
