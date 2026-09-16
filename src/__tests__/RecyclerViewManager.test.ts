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

  it("forwards extraData to getItemType", () => {
    const data = [{ id: 1 }];
    const extraData = { itemType: "featured" };
    const getItemType = jest.fn(
      (item: typeof data[number], index: number, currentExtraData: any) =>
        currentExtraData.itemType
    );
    const manager = new RecyclerViewManager({
      data,
      extraData,
      getItemType,
      renderItem: jest.fn(),
    });

    manager.updateLayoutParams({ width: 100, height: 100 }, 0);
    manager.processDataUpdate();

    expect(getItemType).toHaveBeenCalledWith(data[0], 0, extraData);
  });
});
