import { Dimension, Layout } from "recyclerlistview";

import CustomError from "../errors/CustomError";
import ExceptionList from "../errors/ExceptionList";
import ViewabilityHelper from "../viewability/ViewabilityHelper";

describe("ViewabilityHelper", () => {
  const viewableIndicesChanged = jest.fn();
  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers();
  });

  it("does not report any changes when indices have not changed", () => {
    const viewabilityHelper = new ViewabilityHelper(
      null,
      viewableIndicesChanged
    );
    viewabilityHelper.possiblyViewableIndices = [0, 1, 2];
    updateViewableItems({ viewabilityHelper });
    // Initial call
    expect(viewableIndicesChanged).toHaveBeenCalledWith(
      [0, 1, 2],
      [0, 1, 2],
      []
    );

    // No changes
    viewableIndicesChanged.mockReset();
    updateViewableItems({ viewabilityHelper });
    expect(viewableIndicesChanged).not.toHaveBeenCalled();
  });

  it("reports only viewable indices", () => {
    const viewabilityHelper = new ViewabilityHelper(
      null,
      viewableIndicesChanged
    );
    viewabilityHelper.possiblyViewableIndices = [0, 1, 2, 3];
    updateViewableItems({ viewabilityHelper });
    // Items 0, 1, 2 are initially viewable
    expect(viewableIndicesChanged).toHaveBeenCalledWith(
      [0, 1, 2],
      [0, 1, 2],
      []
    );

    // After scroll, item 3 becomes viewable, too
    updateViewableItems({ viewabilityHelper, scrollOffset: 50 });
    expect(viewableIndicesChanged).toHaveBeenCalledWith([0, 1, 2, 3], [3], []);

    // After additional scroll, the first item is no longer viewable
    updateViewableItems({ viewabilityHelper, scrollOffset: 100 });
    expect(viewableIndicesChanged).toHaveBeenCalledWith([1, 2, 3], [], [0]);
  });

  it("reports only viewable indices when horizontal", () => {
    const viewabilityHelper = new ViewabilityHelper(
      null,
      viewableIndicesChanged
    );
    viewabilityHelper.possiblyViewableIndices = [0, 1, 2, 3];
    const getLayout = (index: number) => {
      return { x: index * 100, y: 0, height: 300, width: 100 } as Layout;
    };
    updateViewableItems({ viewabilityHelper, horizontal: true, getLayout });
    expect(viewableIndicesChanged).toHaveBeenCalledWith(
      [0, 1, 2],
      [0, 1, 2],
      []
    );

    updateViewableItems({
      viewabilityHelper,
      horizontal: true,
      scrollOffset: 50,
      getLayout,
    });
    expect(viewableIndicesChanged).toHaveBeenCalledWith([0, 1, 2, 3], [3], []);

    updateViewableItems({
      viewabilityHelper,
      horizontal: true,
      scrollOffset: 100,
      getLayout,
    });
    expect(viewableIndicesChanged).toHaveBeenCalledWith([1, 2, 3], [], [0]);
  });

  it("reports items only after minimumViewTime has elapsed", () => {
    const viewabilityHelper = new ViewabilityHelper(
      { minimumViewTime: 500 },
      viewableIndicesChanged
    );
    viewabilityHelper.possiblyViewableIndices = [0, 1, 2, 3];
    updateViewableItems({ viewabilityHelper, runAllTimers: false });
    expect(viewableIndicesChanged).not.toHaveBeenCalled();
    jest.advanceTimersByTime(400);
    expect(viewableIndicesChanged).not.toHaveBeenCalled();
    jest.advanceTimersByTime(100);
    expect(viewableIndicesChanged).toHaveBeenCalledWith(
      [0, 1, 2],
      [0, 1, 2],
      []
    );

    viewableIndicesChanged.mockReset();
    updateViewableItems({
      viewabilityHelper,
      scrollOffset: 50,
      runAllTimers: false,
    });
    expect(viewableIndicesChanged).not.toHaveBeenCalled();
    jest.advanceTimersByTime(500);
    expect(viewableIndicesChanged).toHaveBeenCalledWith([0, 1, 2, 3], [3], []);

    viewableIndicesChanged.mockReset();
    updateViewableItems({
      viewabilityHelper,
      scrollOffset: 100,
      runAllTimers: false,
    });
    expect(viewableIndicesChanged).not.toHaveBeenCalled();
    jest.advanceTimersByTime(500);
    expect(viewableIndicesChanged).toHaveBeenCalledWith([1, 2, 3], [], [0]);
  });

  it("reports items that only satisfy itemVisiblePercentThreshold", () => {
    const viewabilityHelper = new ViewabilityHelper(
      { itemVisiblePercentThreshold: 50 },
      viewableIndicesChanged
    );
    viewabilityHelper.possiblyViewableIndices = [0, 1, 2, 3];
    updateViewableItems({
      viewabilityHelper,
    });
    expect(viewableIndicesChanged).toHaveBeenCalledWith(
      [0, 1, 2],
      [0, 1, 2],
      []
    );
    viewableIndicesChanged.mockReset();

    // User scrolled by 50 pixels, making both first and last item visible from 50 %
    updateViewableItems({
      viewabilityHelper,
      scrollOffset: 50,
    });
    expect(viewableIndicesChanged).toHaveBeenCalledWith([0, 1, 2, 3], [3], []);
    viewableIndicesChanged.mockReset();

    // User scrolled by 55 pixels, first item no longer satisfies threshold
    updateViewableItems({
      viewabilityHelper,
      scrollOffset: 55,
    });
    expect(viewableIndicesChanged).toHaveBeenCalledWith([1, 2, 3], [], [0]);
  });

  it("reports items that only satisfy viewAreaCoveragePercentThreshold", () => {
    const getLayout = (index: number) => {
      if (index === 4) {
        return { x: 0, y: index * 100, width: 100, height: 25 } as Layout;
      }
      return { x: 0, y: index * 100, height: 100, width: 300 } as Layout;
    };
    const viewabilityHelper = new ViewabilityHelper(
      { viewAreaCoveragePercentThreshold: 25 },
      viewableIndicesChanged
    );
    viewabilityHelper.possiblyViewableIndices = [0, 1, 2, 3];
    updateViewableItems({
      viewabilityHelper,
      getLayout,
    });
    expect(viewableIndicesChanged).toHaveBeenCalledWith(
      [0, 1, 2],
      [0, 1, 2],
      []
    );
    viewableIndicesChanged.mockReset();

    // User scrolled by 75 pixels.
    // First item is visible only from 25 pixels, not meeting the threshold.
    // The last item is visible from 75 pixels, which is exactly the threshold (300 / 4 = 75 where 300 is height of the list)
    updateViewableItems({
      viewabilityHelper,
      scrollOffset: 75,
      getLayout,
    });
    expect(viewableIndicesChanged).toHaveBeenCalledWith([1, 2, 3], [3], [0]);
    viewableIndicesChanged.mockReset();

    // User scrolled by 110 pixels, making the last small item only partially visible, not meeting the threshold.
    viewabilityHelper.possiblyViewableIndices = [1, 2, 3, 4];
    updateViewableItems({
      viewabilityHelper,
      scrollOffset: 110,
      getLayout,
    });
    expect(viewableIndicesChanged).not.toHaveBeenCalled();

    // User scrolled by 125 pixels, making the last small item completely visible, even when it is not meeting the threshold.
    viewabilityHelper.possiblyViewableIndices = [1, 2, 3, 4];
    updateViewableItems({
      viewabilityHelper,
      scrollOffset: 125,
      getLayout,
    });
    expect(viewableIndicesChanged).toHaveBeenCalledWith([1, 2, 3, 4], [4], []);
  });

  it("reports viewable items only after interaction if waitForInteraction is set to true", () => {
    const viewabilityHelper = new ViewabilityHelper(
      { waitForInteraction: true },
      viewableIndicesChanged
    );
    // Even when elements are visible, viewableIndicesChanged will not be called since interaction has not been recorded, yet
    viewabilityHelper.possiblyViewableIndices = [0, 1, 2, 3];
    updateViewableItems({
      viewabilityHelper,
    });
    // View is scrolled but programatically - not resulting in an interaction
    updateViewableItems({
      viewabilityHelper,
      scrollOffset: 50,
    });
    expect(viewableIndicesChanged).not.toHaveBeenCalled();

    // Interaction is recorded, leading to trigger of viewableIndicesChanged
    viewabilityHelper.hasInteracted = true;
    updateViewableItems({
      viewabilityHelper,
      scrollOffset: 50,
    });
    expect(viewableIndicesChanged).toHaveBeenCalledWith(
      [0, 1, 2, 3],
      [0, 1, 2, 3],
      []
    );
  });

  it("throws multipleViewabilityThresholdTypesNotSupported exception when both viewAreaCoveragePercentThreshold and itemVisiblePercentThreshold are defined", () => {
    const viewabilityHelper = new ViewabilityHelper(
      { viewAreaCoveragePercentThreshold: 1, itemVisiblePercentThreshold: 1 },
      viewableIndicesChanged
    );
    expect(() => updateViewableItems({ viewabilityHelper })).toThrow(
      new CustomError(
        ExceptionList.multipleViewabilityThresholdTypesNotSupported
      )
    );
  });

  const updateViewableItems = ({
    viewabilityHelper,
    horizontal,
    scrollOffset,
    listSize,
    getLayout,
    runAllTimers,
  }: {
    viewabilityHelper: ViewabilityHelper;
    horizontal?: boolean;
    scrollOffset?: number;
    listSize?: Dimension;
    getLayout?: (index: number) => Layout | undefined;
    runAllTimers?: boolean;
  }) => {
    viewabilityHelper.updateViewableItems(
      horizontal ?? false,
      scrollOffset ?? 0,
      listSize ?? { height: 300, width: 300 },
      getLayout ??
        ((index) => {
          return { x: 0, y: index * 100, height: 100, width: 300 } as Layout;
        })
    );
    if (runAllTimers ?? true) {
      jest.runAllTimers();
    }
  };
});
