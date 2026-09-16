import { ErrorMessages } from "../errors/ErrorMessages";
import { WarningMessages } from "../errors/WarningMessages";

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
  /**
   * Snapshot of `keyExtractor(item, index)` results from the last
   * processDataUpdate call, indexed by position. Used to detect when the
   * item at a given index has been replaced by a different one on an
   * in-place data swap so we can invalidate that index's stale measured
   * height/minHeight and let it be remeasured against the new content.
   * See `invalidateChangedLayouts`.
   */
  private prevDataKeys: string[] = [];

  public firstItemOffset = 0;
  public ignoreScrollEvents = false;
  public isFirstPaintOnUiComplete = false;
  public isInitialScrollComplete = false;

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
    this.isInitialScrollComplete = this.getInitialScrollIndex() === undefined;
    this.checkPropsAndWarn();
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

  isInLastRow(index: number): boolean {
    return this.layoutManager?.isInLastRow(index) ?? false;
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
      if (!this.isFirstPaintOnUiComplete) {
        return false;
      }
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
    this.itemViewabilityManager.clearLastReportedViewableIndices();
    this.computeItemViewability();
  }

  processDataUpdate() {
    if (this.hasLayout()) {
      this.invalidateChangedLayouts();
      this.modifyChildrenLayout([], this.propsRef.data?.length ?? 0);
      if (this.hasRenderedProgressively && !this.recomputeEngagedIndices()) {
        // recomputeEngagedIndices will update the render stack if there are any changes in the engaged indices.
        // It's important to update render stack so that elements are assgined right keys incase items were deleted.
        this.updateRenderStack(this.engagedIndicesTracker.getEngagedIndices());
      }
    } else {
      this.recordCurrentDataKeys();
    }
  }

  /**
   * Detects per-index identity changes between the previous and current data
   * arrays (using keyExtractor) and invalidates the cached measured height
   * for indices whose item changed.
   *
   * Without this, an in-place data swap (e.g. category/filter change) leaves
   * the LayoutManager believing every index is still measured at its previous
   * height. In a multi-column grid this leaks the previous row's tallest-item
   * constraint onto the new content: the ViewHolder applies the stale
   * `minHeight`, and the row's `y` for the next row is computed against the
   * stale height — so a taller new card overflows into the row below.
   *
   * Clearing `isHeightMeasured` ensures the next `modifyLayout` call sees
   * the index as needing a fresh recompute via
   * `computeEstimatesAndMinMaxChangedLayout`, and clearing `minHeight` stops
   * the stale constraint from being applied in the next render before the
   * first measurement arrives.
   *
   * No-op when `keyExtractor` is not provided (we cannot safely diff
   * positions without stable keys).
   */
  private invalidateChangedLayouts(): void {
    if (!this.hasStableDataKeys() || !this.layoutManager) {
      this.recordCurrentDataKeys();
      return;
    }
    const newLength = this.getDataLength();
    const layoutCount = this.layoutManager.getLayoutCount();
    const compareLength = Math.min(layoutCount, newLength);
    for (let i = 0; i < compareLength; i++) {
      const oldKey = this.prevDataKeys[i];
      const newKey = this.getDataKey(i);
      if (oldKey !== undefined && oldKey !== newKey) {
        const layout = this.layoutManager.getLayout(i);
        layout.isHeightMeasured = false;
        layout.minHeight = undefined;
      }
    }
    this.recordCurrentDataKeys();
  }

  private recordCurrentDataKeys(): void {
    if (!this.hasStableDataKeys()) {
      this.prevDataKeys.length = 0;
      return;
    }
    const newLength = this.getDataLength();
    this.prevDataKeys.length = newLength;
    for (let i = 0; i < newLength; i++) {
      this.prevDataKeys[i] = this.getDataKey(i);
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
    // Return true if maintainVisibleContentPosition is enabled
    return !this.propsRef.maintainVisibleContentPosition?.disabled;
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

    if (initialScrollIndex !== undefined) {
      // Recompute layouts first, then read the offset. The recompute may
      // re-estimate unmeasured items with an updated average height, changing
      // the target item's position. Reading before recompute would capture a
      // stale offset, causing the wrong items to be rendered.
      this.layoutManager.recomputeLayouts(0, initialScrollIndex);
      const initialItemLayout =
        this.layoutManager.getLayout(initialScrollIndex);
      const initialItemOffset = this.propsRef.horizontal
        ? initialItemLayout.x
        : initialItemLayout.y;
      this.engagedIndicesTracker.scrollOffset = initialItemOffset;
    } else {
      const initialItemLayout = this.layoutManager.getLayout(0);
      const initialItemOffset = this.propsRef.horizontal
        ? initialItemLayout.x
        : initialItemLayout.y;
      this.engagedIndicesTracker.scrollOffset =
        initialItemOffset - this.firstItemOffset;
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

  private checkPropsAndWarn() {
    if (this.propsRef.onStartReached && !this.propsRef.keyExtractor) {
      console.warn(WarningMessages.keyExtractorNotDefinedForMVCP);
    }
  }
}
