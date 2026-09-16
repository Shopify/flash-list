import { ViewabilityConfig } from "react-native";

import { RVDimension, RVLayout } from "../layout-managers/LayoutManager";
import { ErrorMessages } from "../../errors/ErrorMessages";

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
  private visibilityGenerations = new Map<number, number>();
  private updateGeneration = 0;

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
    this.timers.clear();
    this.viewableIndices = [];
    this.visibilityGenerations.clear();
  }

  public updateViewableItems(
    horizontal: boolean,
    scrollOffset: number,
    listSize: RVDimension,
    getLayout: (index: number) => RVLayout | undefined,
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
      throw new Error(
        ErrorMessages.multipleViewabilityThresholdTypesNotSupported
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
    if (
      newViewableIndices.length === this.viewableIndices.length &&
      newViewableIndices.every(
        (index, position) => index === this.viewableIndices[position]
      ) &&
      (this.timers.size > 0 ||
        (newViewableIndices.length ===
          this.lastReportedViewableIndices.length &&
          newViewableIndices.every(
            (index, position) =>
              index === this.lastReportedViewableIndices[position]
          )))
    ) {
      return;
    }
    const generation = ++this.updateGeneration;
    const currentIndices = new Set(newViewableIndices);
    for (const index of this.visibilityGenerations.keys()) {
      if (!currentIndices.has(index)) {
        this.visibilityGenerations.delete(index);
      }
    }
    for (const index of newViewableIndices) {
      if (!this.visibilityGenerations.has(index)) {
        this.visibilityGenerations.set(index, generation);
      }
    }
    this.viewableIndices = newViewableIndices;
    const minimumViewTime = this.viewabilityConfig?.minimumViewTime ?? 250;
    // Setting default to 250. Default of 0 can impact performance when user scrolls fast.
    if (minimumViewTime > 0) {
      const timeoutId = setTimeout(() => {
        this.timers.delete(timeoutId);
        // A returning item must complete a new uninterrupted visibility interval.
        this.checkViewableIndicesChanges(
          newViewableIndices.filter((index) => {
            const visibleSince = this.visibilityGenerations.get(index);
            return visibleSince !== undefined && visibleSince <= generation;
          })
        );
      }, minimumViewTime);
      this.timers.add(timeoutId);
    } else {
      this.checkViewableIndicesChanges(newViewableIndices);
    }
  }

  public checkViewableIndicesChanges(newViewableIndices: number[]) {
    // Check if all viewable indices are still available (applicable if minimumViewTime > 0)
    const currentIndices = new Set(this.viewableIndices);
    const lastReportedIndices = new Set(this.lastReportedViewableIndices);
    const currentlyNewViewableIndices = newViewableIndices.filter((index) =>
      currentIndices.has(index)
    );
    const newIndices = new Set(currentlyNewViewableIndices);
    const newlyVisibleItems = currentlyNewViewableIndices.filter(
      (index) => !lastReportedIndices.has(index)
    );
    const newlyNonvisibleItems = this.lastReportedViewableIndices.filter(
      (index) => !newIndices.has(index)
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

  public clearLastReportedViewableIndices() {
    this.dispose();
    this.lastReportedViewableIndices = [];
  }

  private isItemViewable(
    index: number,
    horizontal: boolean,
    scrollOffset: number,
    listSize: RVDimension,
    viewAreaCoveragePercentThreshold: number | null | undefined,
    itemVisiblePercentThreshold: number | null | undefined,
    getLayout: (index: number) => RVLayout | undefined
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

    if (pixelsVisible <= 0) {
      return false;
    }
    // Always consider item fully viewable if it is fully visible, regardless of the `viewAreaCoveragePercentThreshold`
    if (pixelsVisible === itemSize) {
      return true;
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
