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
  RVViewabilityManager,
  RVViewabilityManagerImpl,
  Velocity,
} from "./ViewabilityManager";

// Abstracts layout manager, key manager and viewability manager and generates render stack (progressively on load)
export class RecyclerViewManager<T> {
  private initialDrawBatchSize = 1;
  private viewabilityManager: RVViewabilityManager;
  private recycleKeyManager: RecycleKeyManager;
  private layoutManager?: RVLayoutManager;
  // Map of index to key
  private renderStack: Map<number, string> = new Map();
  private onRenderStackChanged: (renderStack: Map<number, string>) => void;
  private isFirstLayoutComplete = false;
  private props: RecyclerViewProps<T>;

  public pauseRecyclingOnRenderStackChange = false;
  public firstItemOffset = 0;

  constructor(
    onRenderStackChanged: (renderStack: Map<number, string>) => void,
    props: RecyclerViewProps<T>
  ) {
    this.onRenderStackChanged = onRenderStackChanged;
    this.props = props;
    this.viewabilityManager = new RVViewabilityManagerImpl();
    this.viewabilityManager.setOnEngagedIndicesChangedListener(
      this.updateRenderStack
    );
    this.recycleKeyManager = new RecycleKeyManagerImpl();
  }

  // updates render stack based on the engaged indices which are sorted. Recycles unused keys.
  // TODO: Call getKey anyway if stableIds are present
  public updateRenderStack = (engagedIndices: number[]): void => {
    const newRenderStack = new Map<number, string>();

    for (const [index, key] of this.renderStack) {
      //TODO: Can be optimized since engagedIndices is sorted
      if (!engagedIndices.includes(index)) {
        this.recycleKeyManager.recycleKey(key);
      }
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
        !newRenderStack.has(index)
      ) {
        newRenderStack.set(index, key);
      }
    }

    this.renderStack = newRenderStack;
    this.onRenderStackChanged(this.renderStack);
  };

  updateProps(props: RecyclerViewProps<T>) {
    this.props = props;
    this.viewabilityManager.renderAheadOffset = props.drawDistance;
    if (this.props.drawDistance === 0) {
      this.initialDrawBatchSize = 1;
    } else {
      this.initialDrawBatchSize = (props.numColumns ?? 1) * 2;
    }
  }

  updateScrollOffset(offset: number, velocity?: Velocity) {
    if (this.layoutManager) {
      this.viewabilityManager.updateScrollOffset(
        offset - this.firstItemOffset,
        velocity,
        this.layoutManager
      );
    }
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
  getChildContainerLayout() {
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
    return this.viewabilityManager.scrollOffset;
  }

  // Doesn't include first item offset correction
  getAbsoluteLastScrollOffset() {
    return this.viewabilityManager.scrollOffset + this.firstItemOffset;
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
    return this.viewabilityManager.getVisibleIndices(this.layoutManager);
  }

  modifyChildrenLayout(
    layoutInfo: RVLayoutInfo[],
    dataLength: number
  ): boolean {
    this.layoutManager?.modifyLayout(layoutInfo, dataLength);
    if (dataLength === 0) {
      this.isFirstLayoutComplete = true;
    }
    if (this.layoutManager?.requiresRepaint) {
      this.layoutManager.requiresRepaint = false;
      return true;
    }
    if (this.getIsFirstLayoutComplete()) {
      this.recomputeEngagedIndices();
    } else {
      this.resumeProgressiveRender();
    }
    return false;
  }

  // TODO
  private resumeProgressiveRender() {
    const layoutManager = this.layoutManager;
    if (layoutManager) {
      const initialItemLayout = this.layoutManager?.getLayout(
        this.props.initialScrollIndex ?? 0
      );
      const initialItemOffset = this.props.horizontal
        ? initialItemLayout?.x
        : initialItemLayout?.y;

      if (
        this.props.initialScrollIndex !== undefined &&
        this.props.initialScrollIndex != null
      ) {
        this.viewabilityManager.scrollOffset =
          initialItemOffset ?? 0 + this.firstItemOffset;
      } else {
        this.viewabilityManager.scrollOffset =
          (initialItemOffset ?? 0) - this.firstItemOffset;
      }

      const visibleIndices = this.getVisibleIndices();
      console.log("visibleIndices", visibleIndices);
      this.isFirstLayoutComplete = visibleIndices.every(
        (index) =>
          layoutManager.getLayout(index).isHeightMeasured &&
          layoutManager.getLayout(index).isWidthMeasured
      );
      // If everything is measured then render stack will be in sync. The buffer items will get rendered in the next update
      // triggered by the useOnLoad hook.
      !this.isFirstLayoutComplete &&
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

  private recomputeEngagedIndices() {
    if (this.layoutManager) {
      this.viewabilityManager.updateScrollOffset(
        this.viewabilityManager.scrollOffset,
        null,
        this.layoutManager
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
