import { ConsecutiveNumbers } from "./helpers/ConsecutiveNumbers";
import { RVGridLayoutManagerImpl } from "./layout-managers/GridLayoutManager";
import {
  RVDimension,
  RVLayoutInfo,
  RVLayoutManager,
} from "./layout-managers/LayoutManager";
import { RVLinearLayoutManagerImpl } from "./layout-managers/LinearLayoutManager";
import { RVMasonryLayoutManagerImpl } from "./layout-managers/MasonryLayoutManager";
import { RecycleKeyManagerImpl, RecycleKeyManager } from "./RecycleKeyManager";
import { RecyclerViewProps } from "./RecyclerViewProps";
import {
  RVEngagedIndicesTracker,
  RVEngagedIndicesTrackerImpl,
  Velocity,
} from "./helpers/EngagedIndicesTracker";
import ViewabilityManager from "../viewability/ViewabilityManager";

// Abstracts layout manager, key manager and viewability manager and generates render stack (progressively on load)
export class RecyclerViewManager<T> {
  private initialDrawBatchSize = 1;
  private engagedIndicesTracker: RVEngagedIndicesTracker;
  private recycleKeyManager: RecycleKeyManager;
  private layoutManager?: RVLayoutManager;
  // Map of index to key
  private renderStack: Map<number, string> = new Map();
  private isFirstLayoutComplete = false;
  private hasRenderedProgressively = false;
  private props: RecyclerViewProps<T>;
  private itemViewabilityManager: ViewabilityManager<T>;

  public disableRecycling = false;
  public firstItemOffset = 0;

  constructor(props: RecyclerViewProps<T>) {
    this.props = props;
    this.engagedIndicesTracker = new RVEngagedIndicesTrackerImpl();
    this.recycleKeyManager = new RecycleKeyManagerImpl();
    this.itemViewabilityManager = new ViewabilityManager<T>(this as any);
  }

  // updates render stack based on the engaged indices which are sorted. Recycles unused keys.
  // TODO: Call getKey anyway if stableIds are present
  private updateRenderStack = (engagedIndices: ConsecutiveNumbers): void => {
    //console.log("updateRenderStack", engagedIndices);
    const newRenderStack = new Map<number, string>();
    for (const [index, key] of this.renderStack) {
      //TODO: Can be optimized since engagedIndices is sorted
      if (!engagedIndices.includes(index)) {
        this.recycleKeyManager.recycleKey(key);
      }
    }
    if (this.disableRecycling) {
      this.recycleKeyManager.clearPool();
    }
    for (const index of engagedIndices) {
      // TODO: connect key extractor
      const newKey = this.recycleKeyManager.getKey(
        this.getItemType(index),
        this.getStableId(index),
        this.renderStack.get(index)
      );
      newRenderStack.set(index, newKey);
    }

    //  DANGER
    for (const [index, key] of this.renderStack) {
      if (
        this.recycleKeyManager.hasKeyInPool(key) &&
        !newRenderStack.has(index) &&
        index < (this.props.data?.length ?? 0)
      ) {
        newRenderStack.set(index, key);
      }
    }

    this.renderStack = newRenderStack;
  };

  updateProps(props: RecyclerViewProps<T>) {
    this.props = props;
    this.engagedIndicesTracker.drawDistance =
      props.drawDistance ?? this.engagedIndicesTracker.drawDistance;
    if (this.props.drawDistance === 0) {
      this.initialDrawBatchSize = 1;
    } else {
      this.initialDrawBatchSize = (props.numColumns ?? 1) * 2;
    }
  }

  /**
   * Updates the scroll offset and returns the engaged indices if any
   * @param offset
   * @param velocity
   */
  updateScrollOffset(
    offset: number,
    velocity?: Velocity
  ): ConsecutiveNumbers | undefined {
    if (this.layoutManager) {
      const engagedIndices = this.engagedIndicesTracker.updateScrollOffset(
        offset - this.firstItemOffset,
        velocity,
        this.layoutManager
      );

      if (engagedIndices) {
        this.updateRenderStack(engagedIndices);
        return engagedIndices;
      }
    }
    return undefined;
  }

  getIsFirstLayoutComplete() {
    return this.isFirstLayoutComplete;
  }

  getLayout(index: number) {
    if (!this.layoutManager) {
      throw new Error(
        "LayoutManager is not initialized, layout info is unavailable"
      );
    }
    return this.layoutManager.getLayout(index);
  }

  // Doesn't include header / foot etc
  getChildContainerDimensions() {
    if (!this.layoutManager) {
      throw new Error(
        "LayoutManager is not initialized, child container layout is unavailable"
      );
    }
    return this.layoutManager.getLayoutSize();
  }

  getRenderStack() {
    return this.renderStack;
  }

  getWindowSize() {
    if (!this.layoutManager) {
      throw new Error(
        "LayoutManager is not initialized, window size is unavailable"
      );
    }
    return this.layoutManager.getWindowsSize();
  }

  // Includes first item offset correction
  getLastScrollOffset() {
    return this.engagedIndicesTracker.scrollOffset;
  }

  // Doesn't include first item offset correction
  getAbsoluteLastScrollOffset() {
    return this.engagedIndicesTracker.scrollOffset + this.firstItemOffset;
  }

  updateWindowSize(windowSize: RVDimension, firstItemOffset: number) {
    this.firstItemOffset = firstItemOffset;
    if (this.layoutManager) {
      this.layoutManager.updateLayoutParams({ windowSize });
    } else {
      const LayoutManagerClass = this.props.masonry
        ? RVMasonryLayoutManagerImpl
        : (this.props.numColumns ?? 1) > 1 && !this.props.horizontal
        ? RVGridLayoutManagerImpl
        : RVLinearLayoutManagerImpl;
      // TODO: Check if params can just be forwarded
      const newLayoutManager = new LayoutManagerClass({
        windowSize,
        maxColumns: this.props.numColumns ?? 1,
        horizontal: !!this.props.horizontal,
        optimizeItemArrangement: this.props.optimizeItemArrangement ?? true,
        overrideItemLayout: (index, layout) => {
          this.props?.overrideItemLayout?.(
            layout,
            this.props.data![index],
            index,
            this.props.numColumns ?? 1,
            this.props.extraData
          );
        },
      });
      this.layoutManager = newLayoutManager;
    }
  }

  hasLayout() {
    return this.layoutManager !== undefined;
  }

  getVisibleIndices() {
    if (!this.layoutManager) {
      throw new Error(
        "LayoutManager is not initialized, visible indices are not unavailable"
      );
    }
    return this.engagedIndicesTracker.computeVisibleIndices(this.layoutManager);
  }

  getEngagedIndices() {
    return this.engagedIndicesTracker.getEngagedIndices();
  }

  modifyChildrenLayout(
    layoutInfo: RVLayoutInfo[],
    dataLength: number
  ): boolean {
    this.layoutManager?.modifyLayout(layoutInfo, dataLength);
    if (dataLength === 0) {
      this.isFirstLayoutComplete = true;
      return false;
    }
    if (this.layoutManager?.requiresRepaint) {
      // console.log("requiresRepaint triggered");
      this.layoutManager.requiresRepaint = false;
      return true;
    }
    if (this.hasRenderedProgressively) {
      return this.recomputeEngagedIndices() !== undefined; //TODO: Move to an effect as this can block paint for more than necessary
    } else {
      this.renderProgressively();
    }
    return !this.hasRenderedProgressively;
  }

  computeItemViewability() {
    // Using higher buffer for masonry to avoid missing items
    this.itemViewabilityManager.shouldListenToVisibleIndices &&
      this.itemViewabilityManager.updateViewableItems(
        this.props.masonry
          ? this.engagedIndicesTracker.getEngagedIndices().toArray()
          : this.getVisibleIndices().toArray()
      );
  }

  recordInteraction() {
    this.itemViewabilityManager.recordInteraction();
  }

  recomputeViewableItems() {
    this.itemViewabilityManager.recomputeViewableItems();
  }

  processDataUpdate() {
    if (this.hasLayout()) {
      this.modifyChildrenLayout([], this.props.data?.length ?? 0);
      if (!this.recomputeEngagedIndices()) {
        // recomputeEngagedIndices will update the render stack if there are any changes in the engaged indices.
        // It's important to update render stack so that elements are assgined right keys incase items were deleted.
        this.updateRenderStack(this.engagedIndicesTracker.getEngagedIndices());
      }
    }
  }

  recomputeEngagedIndices(): ConsecutiveNumbers | undefined {
    return this.updateScrollOffset(this.getAbsoluteLastScrollOffset());
  }

  dispose() {
    this.itemViewabilityManager.dispose();
  }

  getInitialScrollIndex() {
    return (
      this.props.initialScrollIndex ??
      (this.props.maintainVisibleContentPosition?.startRenderingFromBottom
        ? this.getDataLength() - 1
        : undefined)
    );
  }

  getDataLength() {
    return this.props.data?.length ?? 0;
  }

  private applyInitialScrollAdjustment() {
    if (!this.layoutManager || this.getDataLength() === 0) {
      return;
    }

    const initialScrollIndex = this.getInitialScrollIndex();
    const initialItemLayout = this.layoutManager?.getLayout(
      initialScrollIndex ?? 0
    );
    const initialItemOffset = this.props.horizontal
      ? initialItemLayout?.x
      : initialItemLayout?.y;

    if (initialScrollIndex !== undefined) {
      // console.log(
      //   "initialItemOffset",
      //   initialScrollIndex,
      //   initialItemOffset,
      //   this.firstItemOffset
      // );
      this.engagedIndicesTracker.scrollOffset =
        initialItemOffset ?? 0 + this.firstItemOffset;
    } else {
      //console.log("initialItemOffset", initialItemOffset, this.firstItemOffset);
      this.engagedIndicesTracker.scrollOffset =
        (initialItemOffset ?? 0) - this.firstItemOffset;
    }
  }

  // TODO
  private renderProgressively() {
    const layoutManager = this.layoutManager;
    if (layoutManager) {
      this.applyInitialScrollAdjustment();
      const visibleIndices = this.getVisibleIndices();
      //console.log("---------> visibleIndices", visibleIndices);
      this.hasRenderedProgressively = visibleIndices.every(
        (index) =>
          layoutManager.getLayout(index).isHeightMeasured &&
          layoutManager.getLayout(index).isWidthMeasured
      );

      if (this.hasRenderedProgressively) {
        this.isFirstLayoutComplete = true;
      }

      // If everything is measured then render stack will be in sync. The buffer items will get rendered in the next update
      // triggered by the useOnLoad hook.
      !this.hasRenderedProgressively &&
        this.updateRenderStack(
          // pick first n indices from visible ones and n is size of renderStack
          visibleIndices.slice(
            0,
            Math.min(
              visibleIndices.length,
              this.renderStack.size + this.initialDrawBatchSize
            )
          )
        );
    }
  }

  private getItemType(index: number): string {
    return (
      this.props.getItemType?.(this.props.data![index], index) ?? "default"
    ).toString();
  }

  private getStableId(index: number): string {
    return (
      this.props.keyExtractor?.(this.props.data![index], index) ??
      index.toString()
    );
  }
}
