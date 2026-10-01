import { RecyclerViewManager } from "../recyclerview/RecyclerViewManager";
import { WarningMessages } from "../errors/WarningMessages";
import { FlashListProps } from "../FlashListProps";

import {
  createPopulatedLayoutManager,
  LayoutManagerType,
} from "./helpers/createLayoutManager";

describe("RecyclerViewManager", () => {
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  const createMockProps = (overrides = {}) =>
    ({
      data: [{ id: 1 }, { id: 2 }, { id: 3 }],
      renderItem: jest.fn(),
      ...overrides,
    } as FlashListProps<unknown>);

  const createManager = (props: FlashListProps<unknown>) => {
    return new RecyclerViewManager(props);
  };

  describe("keyExtractor warning with maintainVisibleContentPosition", () => {
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

  describe("tryGetLayout boundary handling", () => {
    it("should return undefined when no layoutManager has been initialized", () => {
      const manager = createManager(createMockProps());

      expect(manager.tryGetLayout(0)).toBeUndefined();
      expect(manager.tryGetLayout(999)).toBeUndefined();
      expect(manager.tryGetLayout(-1)).toBeUndefined();
    });

    it("should return undefined for an index beyond the current layout count", () => {
      const manager = createManager(createMockProps());
      const layoutManager = createPopulatedLayoutManager(
        LayoutManagerType.LINEAR,
        5
      );
      (manager as any).layoutManager = layoutManager;

      expect(manager.tryGetLayout(2)).toBeDefined();
      expect(manager.tryGetLayout(5)).toBeUndefined();
      expect(manager.tryGetLayout(10)).toBeUndefined();
      expect(manager.tryGetLayout(-1)).toBeUndefined();
    });
  });
});
