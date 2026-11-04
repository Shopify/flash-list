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

  describe("viewability before the first layout", () => {
    const createManager = (overrides = {}) =>
      new RecyclerViewManager({
        data: [1, 2, 3],
        renderItem: jest.fn(),
        ...overrides,
      } as FlashListProps<number>);

    it("does not read the window size when recording an interaction without callbacks", () => {
      const manager = createManager();

      expect(() => manager.recordInteraction()).not.toThrow();
    });

    it("does not read the window size when recording an interaction with callbacks", () => {
      const manager = createManager({
        onViewableItemsChanged: jest.fn(),
      });

      expect(() => manager.recordInteraction()).not.toThrow();
    });

    it("does not compute visible indices before layout when callbacks are configured", () => {
      const manager = createManager({
        onViewableItemsChanged: jest.fn(),
      });

      expect(() => manager.computeItemViewability()).not.toThrow();
    });
  });
});
