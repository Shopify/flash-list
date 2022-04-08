import { Dimension, Layout } from "recyclerlistview";

class ViewabilityHelper {
  /**
   * Viewable indices regardless of the viewability config
   */
  possiblyViewableIndices: number[] = [];

  /**
   * Indicates whether view has been interacted with.
   */
  hasInteracted: boolean = false;

  private viewableIndices: number[] = [];
  private lastReportedViewableIndices: number[] = [];

  private viewableIndicesChanged: (
    indices: number[],
    newlyVisibleIndicies: number[],
    newlyNonvisibleIndices: number[]
  ) => void;

  private timers: Set<NodeJS.Timeout> = new Set();

  constructor(
    viewableIndicesChanged: (
      indices: number[],
      newlyVisibleIndicies: number[],
      newlyNonvisibleIndices: number[]
    ) => void
  ) {
    this.viewableIndicesChanged = viewableIndicesChanged;
  }

  dispose() {
    // Clean up on dismount (clear timers)
  }

  updateViewableItems(
    horizontal: boolean,
    scrollOffset: number,
    listSize: Dimension,
    waitForInteraction: boolean,
    minimumViewTime: number,
    viewAreaCoveragePercentThreshold: number | null | undefined,
    getLayout: (index: number) => Layout | undefined
  ) {
    if (waitForInteraction && !this.hasInteracted) {
      return;
    }
    const newViewableIndices = this.possiblyViewableIndices.filter((index) =>
      this.isItemViewable(
        index,
        horizontal,
        scrollOffset,
        listSize,
        viewAreaCoveragePercentThreshold,
        getLayout
      )
    );
    this.viewableIndices = newViewableIndices;
    if (minimumViewTime > 0) {
      const timeoutId = setTimeout(() => {
        this.timers.delete(timeoutId);
        this.checkViewableIndicesChanges(newViewableIndices);
      }, minimumViewTime);
      this.timers.add(timeoutId);
    } else {
      this.checkViewableIndicesChanges(newViewableIndices);
    }
  }

  checkViewableIndicesChanges(newViewableIndices: number[]) {
    // Check if all viewable indices are still available (applicable if minimumViewTime > 0)
    const currentlyNewViewableIndices = newViewableIndices.filter((index) =>
      this.viewableIndices.includes(index)
    );
    // These can be done faster (for inspiration, look at rlv)
    const newlyVisibleItems = currentlyNewViewableIndices.filter(
      (index) => !this.lastReportedViewableIndices.includes(index)
    );
    const newlyNonvisibleItems = this.lastReportedViewableIndices.filter(
      (index) => !currentlyNewViewableIndices.includes(index)
    );

    if (newlyVisibleItems.length > 0 || newlyNonvisibleItems.length > 0) {
      this.lastReportedViewableIndices = currentlyNewViewableIndices;
      this.viewableIndicesChanged(
        currentlyNewViewableIndices,
        newlyVisibleItems,
        newlyNonvisibleItems
      );
      // requestIdleCallback currently does not work on iOS
      // https://github.com/facebook/react-native/issues/28602
      // if (Platform.OS === "ios") {
      //   this.viewableIndicesChanged(currentlyNewViewableIndices);
      // } else {
      //   requestIdleCallback(
      //     () => {
      //       this.viewableIndicesChanged(currentlyNewViewableIndices);
      //     },
      //     { timeout: 1000 }
      //   );
      // }
    }
  }

  private isItemViewable(
    index: number,
    horizontal: boolean,
    scrollOffset: number,
    listSize: Dimension,
    viewAreaCoveragePercentThreshold: number | null | undefined,
    getLayout: (index: number) => Layout | undefined
  ) {
    const itemLayout = getLayout(index);
    if (itemLayout === undefined) {
      return false;
    }
    let pixelsVisible = 0;
    if (horizontal) {
      // TODO: Implmement
    } else {
      const itemTop = itemLayout.y - scrollOffset;
      pixelsVisible =
        Math.min(itemTop + itemLayout.height, listSize.height) -
        Math.max(itemTop, 0);
      if (
        viewAreaCoveragePercentThreshold !== null &&
        viewAreaCoveragePercentThreshold !== undefined
      ) {
        return (
          pixelsVisible / itemLayout.height >=
          viewAreaCoveragePercentThreshold / 100
        );
      } else {
        return pixelsVisible > 0;
      }
    }
    return true;
  }
}

export default ViewabilityHelper;
