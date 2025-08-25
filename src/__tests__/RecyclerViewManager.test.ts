import { RecyclerViewManager } from "../recyclerview/RecyclerViewManager";
import { WarningMessages } from "../errors/WarningMessages";

describe("RecyclerViewManager", () => {
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe("keyExtractor warning with maintainVisibleContentPosition", () => {
    const createMockProps = (overrides = {}) => ({
      data: [{ id: 1 }, { id: 2 }, { id: 3 }],
      renderItem: jest.fn(),
      stickyHeaderIndices: [],
      getItemType: jest.fn(() => "default"),
      viewabilityConfig: null,
      viewabilityConfigCallbackPairs: [],
      onVisibleItemsChanged: undefined,
      onViewableItemsChanged: undefined,
      horizontal: false,
      inverted: false,
      keyExtractor: undefined,
      extraData: undefined,
      onStartReached: undefined,
      onStartReachedThreshold: undefined,
      onMomentumScrollBegin: undefined,
      onMomentumScrollEnd: undefined,
      onScrollBeginDrag: undefined,
      onScrollEndDrag: undefined,
      onScroll: undefined,
      maxItemsInRecyclePool: undefined,
      ...overrides,
    });

    it("should warn when onStartReached is defined but keyExtractor is not", () => {
      const props = createMockProps({
        onStartReached: jest.fn(),
        keyExtractor: undefined,
      });

      new RecyclerViewManager(props as any);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        WarningMessages.keyExtractorNotDefinedForMVCP
      );
    });

    it("should not warn when both onStartReached and keyExtractor are defined", () => {
      const props = createMockProps({
        onStartReached: jest.fn(),
        keyExtractor: (item: any) => item.id.toString(),
      });

      new RecyclerViewManager(props as any);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it("should not warn when onStartReached is not defined", () => {
      const props = createMockProps({
        onStartReached: undefined,
        keyExtractor: undefined,
      });

      new RecyclerViewManager(props as any);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it("should not warn when onStartReached is not defined but keyExtractor is", () => {
      const props = createMockProps({
        onStartReached: undefined,
        keyExtractor: (item: any) => item.id.toString(),
      });

      new RecyclerViewManager(props as any);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });
});