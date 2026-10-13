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

  describe("measured sizes when items are inserted", () => {
    const windowSize = { width: 400, height: 900 };
    const createProps = (ids: number[]) =>
      ({
        data: ids.map((id) => ({ id })),
        renderItem: jest.fn(),
        keyExtractor: (item: { id: number }) => String(item.id),
      } as FlashListProps<{ id: number }>);
    const measure = <T>(manager: RecyclerViewManager<T>, heights: number[]) =>
      manager.modifyChildrenLayout(
        heights.map((height, index) => ({
          index,
          dimensions: { width: 400, height },
        })),
        heights.length
      );

    it("keeps each measured size with its item when items are prepended", () => {
      const manager = new RecyclerViewManager(createProps([1, 2, 3]));
      manager.updateLayoutParams(windowSize, 0);
      measure(manager, [100, 300, 50]);

      manager.updateProps(createProps([-1, 0, 1, 2, 3]));

      expect(manager.getLayout(2).height).toBe(100);
      expect(manager.getLayout(3).height).toBe(300);
      expect(manager.getLayout(4).height).toBe(50);
      // The new items are estimated, not handed an old item's size.
      expect(manager.getLayout(0).isHeightMeasured).toBeFalsy();
      expect(manager.getLayout(1).isHeightMeasured).toBeFalsy();
      // Positions follow the new order.
      expect(manager.getLayout(3).y).toBe(
        manager.getLayout(2).y + manager.getLayout(2).height
      );
    });

    it("leaves sizes in place when items are appended", () => {
      const manager = new RecyclerViewManager(createProps([1, 2, 3]));
      manager.updateLayoutParams(windowSize, 0);
      measure(manager, [100, 300, 50]);

      manager.updateProps(createProps([1, 2, 3, 4]));

      expect(manager.getLayout(0).height).toBe(100);
      expect(manager.getLayout(1).height).toBe(300);
      expect(manager.getLayout(2).height).toBe(50);
    });
  });
});
