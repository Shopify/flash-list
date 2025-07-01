import { ErrorMessages } from "../errors/ErrorMessages";

import ViewabilityManager from "./viewability/ViewabilityManager";
import { ConsecutiveNumbers } from "./helpers/ConsecutiveNumbers";
import { RVGridLayoutManagerImpl } from "./layout-managers/GridLayoutManager";
import {
  LayoutParams,
  RVDimension,
  RVLayoutInfo,
  RVLayoutManager,
  SpanSizeInfo,
} from "./layout-managers/LayoutManager";
import { RVLinearLayoutManagerImpl } from "./layout-managers/LinearLayoutManager";
import { RVMasonryLayoutManagerImpl } from "./layout-managers/MasonryLayoutManager";
import { RecyclerViewProps } from "./RecyclerViewProps";
import {
  RVEngagedIndicesTracker,
  RVEngagedIndicesTrackerImpl,
  Velocity,
} from "./helpers/EngagedIndicesTracker";
import { RenderStackManager } from "./RenderStackManager";
// Abstracts layout manager, render stack manager and viewability manager and generates render stack (progressively on load)
export class RecyclerViewManager<T> {
  private initialDrawBatchSize = 2;
  private engagedIndicesTracker: RVEngagedIndicesTracker;
  private renderStackManager: RenderStackManager;
  private layoutManager?: RVLayoutManager;
  // Map of index to key
  private isFirstLayoutComplete = false;
  private hasRenderedProgressively = false;
  private progressiveRenderCount = 0;
  private propsRef: RecyclerViewProps<T>;
  private itemViewabilityManager: ViewabilityManager<T>;
  private _isDisposed = false;
  private _isLayoutManagerDirty = false;
  private _animationOptimizationsEnabled = false;

  public firstItemOffset = 0;
  public ignoreScrollEvents = false;

  public get animationOptimizationsEnabled() {
    return this._animationOptimizationsEnabled;
  }

  public set animationOptimizationsEnabled(value: boolean) {
    this._animationOptimizationsEnabled = value;
    this.renderStackManager.disableRecycling = value;
  }

  public get isOffsetProjectionEnabled() {
    return this.engagedIndicesTracker.enableOffsetProjection;
  }

  public get isDisposed() {
    return this._isDisposed;
  }

  public get numColumns() {
    return this.propsRef.numColumns ?? 1;
  }

  constructor(props: RecyclerViewProps<T>) {
    this.getDataKey = this.getDataKey.bind(this);
    this.getItemType = this.getItemType.bind(this);
    this.overrideItemLayout = this.overrideItemLayout.bind(this);
    this.propsRef = props;
    this.engagedIndicesTracker = new RVEngagedIndicesTrackerImpl();
    this.renderStackManager = new RenderStackManager(
      props.maxItemsInRecyclePool
    );
    this.itemViewabilityManager = new ViewabilityManager<T>(this as any);
  }

  // updates render stack based on the engaged indices which are sorted. Recycles unused keys.
  private updateRenderStack = (engagedIndices: ConsecutiveNumbers): void => {
    this.renderStackManager.sync(
      this.getDataKey,
      this.getItemType,
      engagedIndices,
      this.getDataLength()
    );
  };

  get props() {
    return this.propsRef;
  }

  setOffsetProjectionEnabled(value: boolean) {
    this.engagedIndicesTracker.enableOffsetProjection = value;
  }

  updateProps(props: RecyclerViewProps<T>) {
    this.propsRef = props;
    this.engagedIndicesTracker.drawDistance =
      props.drawDistance ?? this.engagedIndicesTracker.drawDistance;
    this.initialDrawBatchSize =
      this.propsRef.overrideProps?.initialDrawBatchSize ??
      this.initialDrawBatchSize;
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
    if (this.layoutManager && !this._isDisposed) {
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

  updateAverageRenderTime(time: number) {
    this.engagedIndicesTracker.averageRenderTime = time;
  }

  getIsFirstLayoutComplete() {
    return this.isFirstLayoutComplete;
  }

  getLayout(index: number) {
    if (!this.layoutManager) {
      throw new Error(ErrorMessages.layoutManagerNotInitializedLayoutInfo);
    }
    return this.layoutManager.getLayout(index);
  }

  tryGetLayout(index: number) {
    if (
      this.layoutManager &&
      index >= 0 &&
      index < this.layoutManager.getLayoutCount()
    ) {
      return this.layoutManager.getLayout(index);
    }
    return undefined;
  }

  // Doesn't include header / foot etc
  getChildContainerDimensions() {
    if (!this.layoutManager) {
      throw new Error(ErrorMessages.layoutManagerNotInitializedChildContainer);
    }
    return this.layoutManager.getLayoutSize();
  }

  getRenderStack() {
    return this.renderStackManager.getRenderStack();
  }

  getWindowSize() {
    if (!this.layoutManager) {
      throw new Error(ErrorMessages.layoutManagerNotInitializedWindowSize);
    }
    return this.layoutManager.getWindowsSize();
  }

  // Includes first item offset correction
  getLastScrollOffset() {
    return this.engagedIndicesTracker.scrollOffset;
  }

  getMaxScrollOffset() {
    return Math.max(
      0,
      (this.propsRef.horizontal
        ? this.getChildContainerDimensions().width
        : this.getChildContainerDimensions().height) -
        (this.propsRef.horizontal
          ? this.getWindowSize().width
          : this.getWindowSize().height) +
        this.firstItemOffset
    );
  }

  // Doesn't include first item offset correction
  getAbsoluteLastScrollOffset() {
    return this.engagedIndicesTracker.scrollOffset + this.firstItemOffset;
  }

  setScrollDirection(scrollDirection: "forward" | "backward") {
    this.engagedIndicesTracker.setScrollDirection(scrollDirection);
  }

  resetVelocityCompute() {
    this.engagedIndicesTracker.resetVelocityHistory();
  }

  updateLayoutParams(windowSize: RVDimension, firstItemOffset: number) {
    this.firstItemOffset = firstItemOffset;
    const LayoutManagerClass = this.getLayoutManagerClass();
    if (
      this.layoutManager &&
      Boolean(this.layoutManager?.isHorizontal()) !==
        Boolean(this.propsRef.horizontal)
    ) {
      throw new Error(ErrorMessages.horizontalPropCannotBeToggled);
    }
    if (this._isLayoutManagerDirty) {
      this.layoutManager = undefined;
      this._isLayoutManagerDirty = false;
    }
    const layoutManagerParams: LayoutParams = {
      windowSize,
      maxColumns: this.numColumns,
      horizontal: Boolean(this.propsRef.horizontal),
      optimizeItemArrangement: this.propsRef.optimizeItemArrangement ?? true,
      overrideItemLayout: this.overrideItemLayout,
      getItemType: this.getItemType,
    };
    if (!(this.layoutManager instanceof LayoutManagerClass)) {
      // console.log("-----> new LayoutManagerClass");

      this.layoutManager = new LayoutManagerClass(
        layoutManagerParams,
        this.layoutManager
      );
    } else {
      this.layoutManager.updateLayoutParams(layoutManagerParams);
    }
  }

  hasLayout() {
    return this.layoutManager !== undefined;
  }

  computeVisibleIndices() {
    if (!this.layoutManager) {
      throw new Error(ErrorMessages.layoutManagerNotInitializedVisibleIndices);
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
      return false;
    }
    if (this.layoutManager?.requiresRepaint) {
      // console.log("requiresRepaint triggered");
      this.layoutManager.requiresRepaint = false;
      return true;
    }
    if (this.hasRenderedProgressively) {
      return this.recomputeEngagedIndices() !== undefined;
    } else {
      this.renderProgressively();
    }
    return !this.hasRenderedProgressively;
  }

  computeItemViewability() {
    // Using higher buffer for masonry to avoid missing items
    this.itemViewabilityManager.shouldListenToVisibleIndices &&
      this.itemViewabilityManager.updateViewableItems(
        this.propsRef.masonry
          ? this.engagedIndicesTracker.getEngagedIndices().toArray()
          : this.computeVisibleIndices().toArray()
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
      this.modifyChildrenLayout([], this.propsRef.data?.length ?? 0);
      if (this.hasRenderedProgressively && !this.recomputeEngagedIndices()) {
        // recomputeEngagedIndices will update the render stack if there are any changes in the engaged indices.
        // It's important to update render stack so that elements are assgined right keys incase items were deleted.
        this.updateRenderStack(this.engagedIndicesTracker.getEngagedIndices());
      }
    }
  }

  recomputeEngagedIndices(): ConsecutiveNumbers | undefined {
    return this.updateScrollOffset(this.getAbsoluteLastScrollOffset());
  }

  restoreIfNeeded() {
    if (this._isDisposed) {
      this._isDisposed = false;
    }
  }

  dispose() {
    this._isDisposed = true;
    this.itemViewabilityManager.dispose();
  }

  markLayoutManagerDirty() {
    this._isLayoutManagerDirty = true;
  }

  getInitialScrollIndex() {
    return (
      this.propsRef.initialScrollIndex ??
      (this.propsRef.maintainVisibleContentPosition?.startRenderingFromBottom
        ? this.getDataLength() - 1
        : undefined)
    );
  }

  shouldMaintainVisibleContentPosition() {
    // Return true if maintainVisibleContentPosition is enabled and not horizontal
    return (
      !this.propsRef.maintainVisibleContentPosition?.disabled &&
      !this.propsRef.horizontal
    );
  }

  getDataLength() {
    return this.propsRef.data?.length ?? 0;
  }

  hasStableDataKeys() {
    return Boolean(this.propsRef.keyExtractor);
  }

  getDataKey(index: number): string {
    return (
      this.propsRef.keyExtractor?.(this.propsRef.data![index], index) ??
      index.toString()
    );
  }

  private getLayoutManagerClass() {
    // throw errors for incompatible props
    if (this.propsRef.masonry && this.propsRef.horizontal) {
      throw new Error(ErrorMessages.masonryAndHorizontalIncompatible);
    }
    if (this.numColumns > 1 && this.propsRef.horizontal) {
      throw new Error(ErrorMessages.numColumnsAndHorizontalIncompatible);
    }
    return this.propsRef.masonry
      ? RVMasonryLayoutManagerImpl
      : this.numColumns > 1 && !this.propsRef.horizontal
      ? RVGridLayoutManagerImpl
      : RVLinearLayoutManagerImpl;
  }

  private applyInitialScrollAdjustment() {
    if (!this.layoutManager || this.getDataLength() === 0) {
      return;
    }

    const initialScrollIndex = this.getInitialScrollIndex();
    const initialItemLayout = this.layoutManager?.getLayout(
      initialScrollIndex ?? 0
    );
    const initialItemOffset = this.propsRef.horizontal
      ? initialItemLayout?.x
      : initialItemLayout?.y;

    if (initialScrollIndex !== undefined) {
      // console.log(
      //   "initialItemOffset",
      //   initialScrollIndex,
      //   initialItemOffset,
      //   this.firstItemOffset
      // );
      this.layoutManager.recomputeLayouts(0, initialScrollIndex);
      this.engagedIndicesTracker.scrollOffset =
        initialItemOffset ?? 0 + this.firstItemOffset;
    } else {
      // console.log("initialItemOffset", initialItemOffset, this.firstItemOffset);
      this.engagedIndicesTracker.scrollOffset =
        (initialItemOffset ?? 0) - this.firstItemOffset;
    }
  }

  private renderProgressively() {
    this.progressiveRenderCount++;
    const layoutManager = this.layoutManager;
    if (layoutManager) {
      this.applyInitialScrollAdjustment();
      const visibleIndices = this.computeVisibleIndices();
      // console.log("---------> visibleIndices", visibleIndices);
      this.hasRenderedProgressively = visibleIndices.every(
        (index) =>
          layoutManager.getLayout(index).isHeightMeasured &&
          layoutManager.getLayout(index).isWidthMeasured
      );

      if (this.hasRenderedProgressively) {
        this.isFirstLayoutComplete = true;
      }

      const batchSize =
        this.numColumns *
        this.initialDrawBatchSize ** Math.ceil(this.progressiveRenderCount / 5);

      // If everything is measured then render stack will be in sync. The buffer items will get rendered in the next update
      // triggered by the useOnLoad hook.
      !this.hasRenderedProgressively &&
        this.updateRenderStack(
          // pick first n indices from visible ones based on batch size
          visibleIndices.slice(
            0,
            Math.min(
              visibleIndices.length,
              this.getRenderStack().size + batchSize
            )
          )
        );
    }
  }

  private getItemType(index: number): string {
    return (
      this.propsRef.getItemType?.(this.propsRef.data![index], index) ??
      "default"
    ).toString();
  }

  private overrideItemLayout(index: number, layout: SpanSizeInfo) {
    this.propsRef?.overrideItemLayout?.(
      layout,
      this.propsRef.data![index],
      index,
      this.numColumns,
      this.propsRef.extraData
    );
  }
}
