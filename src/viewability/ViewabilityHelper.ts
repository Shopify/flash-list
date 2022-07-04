import { ViewabilityConfig } from "react-native";
import { Dimension, Layout } from "recyclerlistview";

import CustomError from "../errors/CustomError";
import ExceptionList from "../errors/ExceptionList";

/**
 * Helper class for computing viewable items based on the passed `viewabilityConfig`.
 * Note methods in this class will be invoked on every scroll and should be optimized for performance.
 */
class ViewabilityHelper {
  /**
   * Viewable indices regardless of the viewability config
   */
  possiblyViewableIndices: number[] = [];

  hasInteracted = false;

  private viewableIndices: number[] = [];
  private lastReportedViewableIndices: number[] = [];

  private viewabilityConfig: ViewabilityConfig | null | undefined;
  private viewableIndicesChanged: (
    indices: number[],
    newlyVisibleIndicies: number[],
    newlyNonvisibleIndices: number[]
  ) => void;

  private timers: Set<NodeJS.Timeout> = new Set();

  constructor(
    viewabilityConfig: ViewabilityConfig | null | undefined,
    viewableIndicesChanged: (
      indices: number[],
      newlyVisibleIndicies: number[],
      newlyNonvisibleIndices: number[]
    ) => void
  ) {
    this.viewabilityConfig = viewabilityConfig;
    this.viewableIndicesChanged = viewableIndicesChanged;
  }

  public dispose() {
    // Clean up on dismount
    this.timers.forEach(clearTimeout);
  }

  public updateViewableItems(
    horizontal: boolean,
    scrollOffset: number,
    listSize: Dimension,
    getLayout: (index: number) => Layout | undefined,
    viewableIndices?: number[]
  ) {
    if (viewableIndices !== undefined) {
      this.possiblyViewableIndices = viewableIndices;
    }
    if (
      this.viewabilityConfig?.itemVisiblePercentThreshold !== null &&
      this.viewabilityConfig?.itemVisiblePercentThreshold !== undefined &&
      this.viewabilityConfig?.viewAreaCoveragePercentThreshold !== null &&
      this.viewabilityConfig?.viewAreaCoveragePercentThreshold !== undefined
    ) {
      throw new CustomError(
        ExceptionList.multipleViewabilityThresholdTypesNotSupported
      );
    }
    if (
      (this.viewabilityConfig?.waitForInteraction ?? false) &&
      !this.hasInteracted
    ) {
      return;
    }
    const newViewableIndices = this.possiblyViewableIndices.filter((index) =>
      this.isItemViewable(
        index,
        horizontal,
        scrollOffset,
        listSize,
        this.viewabilityConfig?.viewAreaCoveragePercentThreshold,
        this.viewabilityConfig?.itemVisiblePercentThreshold,
        getLayout
      )
    );
    this.viewableIndices = newViewableIndices;
    const minimumViewTime = this.viewabilityConfig?.minimumViewTime ?? 250;
    // Setting default to 250. Default of 0 can impact performance when user scrolls fast.
    if (minimumViewTime > 0) {
      const timeoutId = setTimeout(() => {
        this.timers.delete(timeoutId);
        this.checkViewableIndicesChanges(newViewableIndices);
        this.timers.add(timeoutId);
      }, minimumViewTime);
    } else {
      this.checkViewableIndicesChanges(newViewableIndices);
    }
  }

  public checkViewableIndicesChanges(newViewableIndices: number[]) {
    // Check if all viewable indices are still available (applicable if minimumViewTime > 0)
    const currentlyNewViewableIndices = newViewableIndices.filter((index) =>
      this.viewableIndices.includes(index)
    );
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
    }
  }

  private isItemViewable(
    index: number,
    horizontal: boolean,
    scrollOffset: number,
    listSize: Dimension,
    viewAreaCoveragePercentThreshold: number | null | undefined,
    itemVisiblePercentThreshold: number | null | undefined,
    getLayout: (index: number) => Layout | undefined
  ) {
    const itemLayout = getLayout(index);
    if (itemLayout === undefined) {
      return false;
    }
    const itemTop = (horizontal ? itemLayout.x : itemLayout.y) - scrollOffset;
    const itemSize = horizontal ? itemLayout.width : itemLayout.height;
    const listMainSize = horizontal ? listSize.width : listSize.height;
    const pixelsVisible =
      Math.min(itemTop + itemSize, listMainSize) - Math.max(itemTop, 0);

    // Always consider item fully viewable if it is fully visible, regardless of the `viewAreaCoveragePercentThreshold`
    if (pixelsVisible === itemSize) {
      return true;
    }
    // Skip checking item if it's not visible at all
    if (pixelsVisible === 0) {
      return false;
    }
    const viewAreaMode =
      viewAreaCoveragePercentThreshold !== null &&
      viewAreaCoveragePercentThreshold !== undefined;
    const percent = viewAreaMode
      ? pixelsVisible / listMainSize
      : pixelsVisible / itemSize;
    const viewableAreaPercentThreshold = viewAreaMode
      ? viewAreaCoveragePercentThreshold * 0.01
      : (itemVisiblePercentThreshold ?? 0) * 0.01;

    return percent >= viewableAreaPercentThreshold;
  }
}

export default ViewabilityHelper;
