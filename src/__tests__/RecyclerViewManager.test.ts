import { RecyclerViewManager } from "../recyclerview/RecyclerViewManager";
import { WarningMessages } from "../errors/WarningMessages";
import { FlashListProps } from "../FlashListProps";

describe("RecyclerViewManager", () => {
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe("keyExtractor warning with maintainVisibleContentPosition", () => {
    const createMockProps = (overrides = {}) =>
      ({
        data: [{ id: 1 }, { id: 2 }, { id: 3 }],
        renderItem: jest.fn(),
        ...overrides,
      } as FlashListProps<unknown>);

    const createManager = (props: FlashListProps<unknown>) => {
      return new RecyclerViewManager(props);
    };

    it("should warn when onStartReached is defined but keyExtractor is not", () => {
      const props = createMockProps({
        onStartReached: jest.fn(),
        keyExtractor: undefined,
      });

      createManager(props);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        WarningMessages.keyExtractorNotDefinedForMVCP
      );
    });

    it("should not warn when both onStartReached and keyExtractor are defined", () => {
      const props = createMockProps({
        onStartReached: jest.fn(),
        keyExtractor: (item: any) => item.id.toString(),
      });

      createManager(props);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it("should not warn when onStartReached is not defined", () => {
      const props = createMockProps({
        onStartReached: undefined,
        keyExtractor: undefined,
      });

      createManager(props);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it("should not warn when onStartReached is not defined but keyExtractor is", () => {
      const props = createMockProps({
        onStartReached: undefined,
        keyExtractor: (item: any) => item.id.toString(),
      });

      createManager(props);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe("processDataUpdate — layout invalidation on in-place data swap", () => {
    interface Item {
      id: number;
    }
    const keyExtractor = (item: Item) => `item-${item.id}`;

    const createGridManager = (data: Item[], overrides = {}) => {
      const props = {
        data,
        renderItem: jest.fn(),
        keyExtractor,
        numColumns: 2,
        ...overrides,
      } as FlashListProps<Item>;
      const manager = new RecyclerViewManager<Item>(props);
      manager.processDataUpdate();
      manager.updateLayoutParams({ width: 400, height: 900 }, 0);
      manager.processDataUpdate();
      return manager;
    };

    const markAsMeasured = (
      manager: RecyclerViewManager<Item>,
      indices: number[],
      height: number
    ) => {
      for (const i of indices) {
        const layout = manager.getLayout(i);
        layout.isHeightMeasured = true;
        layout.minHeight = height;
        layout.height = height;
      }
    };

    it("invalidates cached height for indices whose key changed", () => {
      const initialData: Item[] = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
      const manager = createGridManager(initialData);
      markAsMeasured(manager, [0, 1, 2, 3], 200);

      // Replace items at index 0 and 2 (different identities)
      const swappedData: Item[] = [
        { id: 100 },
        initialData[1],
        { id: 300 },
        initialData[3],
      ];
      manager.updateProps({
        ...manager.props,
        data: swappedData,
      });
      manager.processDataUpdate();

      expect(manager.getLayout(0).isHeightMeasured).toBe(false);
      expect(manager.getLayout(0).minHeight).toBeUndefined();
      expect(manager.getLayout(2).isHeightMeasured).toBe(false);
      expect(manager.getLayout(2).minHeight).toBeUndefined();

      // Unchanged identities keep their cached measurement
      expect(manager.getLayout(1).isHeightMeasured).toBe(true);
      expect(manager.getLayout(1).minHeight).toBe(200);
      expect(manager.getLayout(3).isHeightMeasured).toBe(true);
      expect(manager.getLayout(3).minHeight).toBe(200);
    });

    it("invalidates every index when the whole array is replaced", () => {
      const initialData: Item[] = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
      const manager = createGridManager(initialData);
      markAsMeasured(manager, [0, 1, 2, 3], 200);

      // Category switch — entirely different items at every position
      const swappedData: Item[] = [
        { id: 10 },
        { id: 20 },
        { id: 30 },
        { id: 40 },
      ];
      manager.updateProps({
        ...manager.props,
        data: swappedData,
      });
      manager.processDataUpdate();

      for (let i = 0; i < swappedData.length; i++) {
        expect(manager.getLayout(i).isHeightMeasured).toBe(false);
        expect(manager.getLayout(i).minHeight).toBeUndefined();
      }
    });

    it("does not invalidate when the same items are re-emitted at the same positions", () => {
      const initialData: Item[] = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
      const manager = createGridManager(initialData);
      markAsMeasured(manager, [0, 1, 2, 3], 200);

      // New array reference, same identities — e.g. a query refetch returning equal data
      const sameData: Item[] = initialData.map((item) => ({ id: item.id }));
      manager.updateProps({
        ...manager.props,
        data: sameData,
      });
      manager.processDataUpdate();

      for (let i = 0; i < sameData.length; i++) {
        expect(manager.getLayout(i).isHeightMeasured).toBe(true);
        expect(manager.getLayout(i).minHeight).toBe(200);
      }
    });

    it("does not invalidate measured heights for indices that survived an append", () => {
      const initialData: Item[] = [{ id: 1 }, { id: 2 }];
      const manager = createGridManager(initialData);
      markAsMeasured(manager, [0, 1], 200);

      const appendedData: Item[] = [...initialData, { id: 3 }, { id: 4 }];
      manager.updateProps({
        ...manager.props,
        data: appendedData,
      });
      manager.processDataUpdate();

      // Pre-existing indices: keys unchanged, so invalidation must not reset
      // `isHeightMeasured` or `height` (the per-row normalization that runs
      // when new indices are appended is a separate concern).
      expect(manager.getLayout(0).isHeightMeasured).toBe(true);
      expect(manager.getLayout(0).height).toBe(200);
      expect(manager.getLayout(1).isHeightMeasured).toBe(true);
      expect(manager.getLayout(1).height).toBe(200);
    });

    it("is a no-op when keyExtractor is not provided", () => {
      const initialData: Item[] = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
      const props = {
        data: initialData,
        renderItem: jest.fn(),
        numColumns: 2,
      } as FlashListProps<Item>;
      const manager = new RecyclerViewManager<Item>(props);
      manager.processDataUpdate();
      manager.updateLayoutParams({ width: 400, height: 900 }, 0);
      manager.processDataUpdate();
      markAsMeasured(manager, [0, 1, 2, 3], 200);

      const swappedData: Item[] = [
        { id: 10 },
        { id: 20 },
        { id: 30 },
        { id: 40 },
      ];
      manager.updateProps({
        ...manager.props,
        data: swappedData,
      });
      manager.processDataUpdate();

      // Without stable keys we cannot tell positions apart safely, so we leave
      // the cached measurements alone (matching the pre-fix behavior).
      for (let i = 0; i < swappedData.length; i++) {
        expect(manager.getLayout(i).isHeightMeasured).toBe(true);
        expect(manager.getLayout(i).minHeight).toBe(200);
      }
    });
  });
});
