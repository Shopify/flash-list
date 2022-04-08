import { ViewabilityConfig } from "react-native";
import { Dimension, Layout } from "recyclerlistview";

import ViewabilityHelper from "../ViewabilityHelper";

describe("ViewabilityHelper", () => {
  const viewableIndicesChanged = jest.fn();
  let viewabilityHelper: ViewabilityHelper;
  beforeEach(() => {
    jest.resetAllMocks();
    viewabilityHelper = new ViewabilityHelper(viewableIndicesChanged);
  });

  it("does not report any changes when indices have not changed", () => {
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
    viewabilityHelper.possiblyViewableIndices = [0, 1, 2, 3];
    updateViewableItems({ viewabilityHelper });
    expect(viewableIndicesChanged).toHaveBeenCalledWith(
      [0, 1, 2],
      [0, 1, 2],
      []
    );

    updateViewableItems({ viewabilityHelper, scrollOffset: 50 });
    expect(viewableIndicesChanged).toHaveBeenCalledWith([0, 1, 2, 3], [3], []);

    updateViewableItems({ viewabilityHelper, scrollOffset: 100 });
    expect(viewableIndicesChanged).toHaveBeenCalledWith([1, 2, 3], [], [0]);
  });

  it("reports only viewable indices when horizontal", () => {
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

  it("reports items that only satisfy itemVisiblePercentThreshold", () => {
    viewabilityHelper.possiblyViewableIndices = [0, 1, 2, 3];
    updateViewableItems({
      viewabilityHelper,
      viewabilityConfig: { itemVisiblePercentThreshold: 0.5 },
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
      viewabilityConfig: { itemVisiblePercentThreshold: 0.5 },
    });
    expect(viewableIndicesChanged).toHaveBeenCalledWith([0, 1, 2, 3], [3], []);
    viewableIndicesChanged.mockReset();

    // User scrolled by 55 pixels, first item no longer satisfies threshold
    updateViewableItems({
      viewabilityHelper,
      scrollOffset: 55,
      viewabilityConfig: { itemVisiblePercentThreshold: 0.5 },
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
    const viewabilityConfig: ViewabilityConfig = {
      viewAreaCoveragePercentThreshold: 0.25,
    };
    viewabilityHelper.possiblyViewableIndices = [0, 1, 2, 3];
    updateViewableItems({
      viewabilityHelper,
      viewabilityConfig,
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
      viewabilityConfig,
      getLayout,
    });
    expect(viewableIndicesChanged).toHaveBeenCalledWith([1, 2, 3], [3], [0]);
    viewableIndicesChanged.mockReset();

    // User scrolled by 110 pixels, making the last small item only partially visible, not meeting the threshold.
    viewabilityHelper.possiblyViewableIndices = [1, 2, 3, 4];
    updateViewableItems({
      viewabilityHelper,
      scrollOffset: 110,
      viewabilityConfig,
      getLayout,
    });
    expect(viewableIndicesChanged).not.toHaveBeenCalled();

    // User scrolled by 125 pixels, making the last small item completely visible, even when it is not meeting the threshold.
    viewabilityHelper.possiblyViewableIndices = [1, 2, 3, 4];
    updateViewableItems({
      viewabilityHelper,
      scrollOffset: 125,
      viewabilityConfig,
      getLayout,
    });
    expect(viewableIndicesChanged).toHaveBeenCalledWith([1, 2, 3, 4], [4], []);
  });

  it("reposts viewable items only after interaction if waitForInteraction is set to true", () => {
    // Even when elements are visible, viewableIndicesChanged will not be called since interaction has not been recorded, yet
    viewabilityHelper.possiblyViewableIndices = [0, 1, 2, 3];
    const viewabilityConfig: ViewabilityConfig = { waitForInteraction: true };
    updateViewableItems({
      viewabilityHelper,
      viewabilityConfig,
    });
    // View is scrolled but programatically - not resulting in an interaction
    updateViewableItems({
      viewabilityHelper,
      scrollOffset: 50,
      viewabilityConfig,
    });
    expect(viewableIndicesChanged).not.toHaveBeenCalled();

    // Interaction is recorded, leading to trigger of viewableIndicesChanged
    viewabilityHelper.hasInteracted = true;
    updateViewableItems({
      viewabilityHelper,
      scrollOffset: 50,
      viewabilityConfig,
    });
    expect(viewableIndicesChanged).toHaveBeenCalledWith(
      [0, 1, 2, 3],
      [0, 1, 2, 3],
      []
    );
  });

  const updateViewableItems = ({
    viewabilityHelper,
    horizontal,
    scrollOffset,
    listSize,
    viewabilityConfig,
    getLayout,
  }: {
    viewabilityHelper: ViewabilityHelper;
    horizontal?: boolean;
    scrollOffset?: number;
    listSize?: Dimension;
    viewabilityConfig?: ViewabilityConfig;
    getLayout?: (index: number) => Layout | undefined;
  }) => {
    viewabilityHelper.updateViewableItems(
      horizontal ?? false,
      scrollOffset ?? 0,
      listSize ?? { height: 300, width: 300 },
      viewabilityConfig,
      getLayout ??
        ((index) => {
          return { x: 0, y: index * 100, height: 100, width: 300 } as Layout;
        })
    );
  };
});
