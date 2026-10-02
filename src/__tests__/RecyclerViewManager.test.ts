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

  describe("modifyChildrenLayout render stack", () => {
    const createMeasuredInfos = (count: number) =>
      Array.from({ length: count }, (_, index) => ({
        index,
        dimensions: { width: 400, height: 50 },
      }));

    const createManagerWithData = (length: number) => {
      const data = Array.from({ length }, (_, id) => ({ id }));
      return new RecyclerViewManager({
        data,
        renderItem: jest.fn(),
      } as FlashListProps<{ id: number }>);
    };

    it("drops render stack keys past the truncated layout table", () => {
      const manager = createManagerWithData(20);
      manager.updateLayoutParams({ width: 400, height: 900 }, 0);

      manager.modifyChildrenLayout([], 20);
      expect(manager.getRenderStack().size).toBeGreaterThan(0);

      manager.modifyChildrenLayout(createMeasuredInfos(20), 20);
      manager.isFirstPaintOnUiComplete = true;
      (
        manager as { hasRenderedProgressively: boolean }
      ).hasRenderedProgressively = true;

      manager.updateProps({
        data: Array.from({ length: 5 }, (_, id) => ({ id })),
        renderItem: jest.fn(),
      } as FlashListProps<{ id: number }>);

      manager.modifyChildrenLayout([], 5);

      const remainingIndices = Array.from(
        manager.getRenderStack().values()
      ).map((info) => info.index);
      expect(remainingIndices.every((index) => index < 5)).toBe(true);
      expect(() => manager.getLayout(4)).not.toThrow();
      expect(() => manager.getLayout(5)).toThrow();
    });

    it("prunes the render stack when first paint is not complete", () => {
      const manager = createManagerWithData(20);
      manager.updateLayoutParams({ width: 400, height: 900 }, 0);
      manager.modifyChildrenLayout([], 20);
      manager.modifyChildrenLayout(createMeasuredInfos(20), 20);
      (
        manager as { hasRenderedProgressively: boolean }
      ).hasRenderedProgressively = true;
      manager.isFirstPaintOnUiComplete = false;

      manager.updateProps({
        data: Array.from({ length: 3 }, (_, id) => ({ id })),
        renderItem: jest.fn(),
      } as FlashListProps<{ id: number }>);

      manager.modifyChildrenLayout([], 3);

      const remainingIndices = Array.from(
        manager.getRenderStack().values()
      ).map((info) => info.index);
      expect(remainingIndices.every((index) => index < 3)).toBe(true);
    });
  });
});
