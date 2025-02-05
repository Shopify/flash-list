import { RVGridLayoutManagerImpl } from "./GridLayoutManager";
import {
  RVDimension,
  RVLayoutInfo,
  RVLayoutManager,
  RVLinearLayoutManagerImpl,
} from "./LayoutManager";
import { RecycleKeyManagerImpl, RecycleKeyManager } from "./RecycleKeyManager";
import { RecyclerViewProps } from "./RecyclerViewProps";
import {
  RVViewabilityManager,
  RVViewabilityManagerImpl,
} from "./ViewabilityManager";

// Abstracts layout manager and viewability manager
export class RecyclerViewManager<T> {
  INITIAL_NUM_TO_RENDER = 1;
  private viewabilityManager: RVViewabilityManager;
  private recycleKeyManager: RecycleKeyManager;
  private layoutManager?: RVLayoutManager;
  // Map of index to key
  private renderStack: Map<number, string> = new Map();
  private onRenderStackChanged: (renderStack: Map<number, string>) => void;
  private isFirstLayoutComplete = false;
  private stableIdProvider: (index: number) => string;
  private getItemType: (index: number) => string;
  private props: RecyclerViewProps<T>;

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
    this.stableIdProvider = (index) => index.toString();
    this.getItemType = () => "type1";
  }

  // updates render stack based on the engaged indices which are sorted. Recycles unused keys.
  // TODO: Call getKey anyway if stableIds are present
  private updateRenderStack = (engagedIndices: number[]): void => {
    const newRenderStack = new Map<number, string>();

    for (const [index, key] of this.renderStack) {
      if (!engagedIndices.includes(index)) {
        this.recycleKeyManager.recycleKey(key);
      }
    }
    for (const index of engagedIndices) {
      // TODO: connect key extractor
      const newKey = this.recycleKeyManager.getKey(
        this.getItemType(index),
        this.stableIdProvider(index),
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
  }

  updateLayoutManager(layoutManager: RVLayoutManager) {
    this.layoutManager = layoutManager;
  }

  updateKeyExtractor(stableIdProvider: (index: number) => string) {
    this.stableIdProvider = stableIdProvider;
  }

  updateGetItemType(getItemType: (index: number) => string) {
    this.getItemType = getItemType;
  }

  updateScrollOffset(offset: number) {
    if (this.layoutManager) {
      this.viewabilityManager.updateScrollOffset(offset, this.layoutManager);
    }
  }

  // TODO
  resumeProgressiveRender() {
    const layoutManager = this.layoutManager;
    if (layoutManager && this.renderStack.size > 0) {
      const visibleIndices = this.getVisibleIndices();
      const isFullyMeasured = visibleIndices.every(
        (index) =>
          layoutManager.getLayout(index).isHeightMeasured &&
          layoutManager.getLayout(index).isWidthMeasured
      );
      if (!isFullyMeasured) {
        this.updateRenderStack(
          // pick first n indices from visible ones and n is size of renderStack
          visibleIndices.slice(
            0,
            Math.min(visibleIndices.length, this.renderStack.size + 1)
          )
        );
      }
      if (isFullyMeasured && !this.isFirstLayoutComplete) {
        this.isFirstLayoutComplete = true;
      }
      return isFullyMeasured;
    }
    return false;
  }

  startRender() {
    if (this.renderStack.size === 0) {
      // TODO
      const visibleIndices = [0];
      this.updateRenderStack(
        visibleIndices.slice(0, Math.min(1, visibleIndices.length))
      );
    }
  }

  recomputeEngagedIndices() {
    if (this.layoutManager) {
      this.viewabilityManager.updateScrollOffset(
        this.viewabilityManager.getScrollOffset(),
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

  getLastScrollOffset() {
    return this.viewabilityManager.getScrollOffset();
  }

  updateWindowSize(windowSize: RVDimension) {
    if (this.layoutManager) {
      this.layoutManager.updateLayoutParams({ windowSize });
    } else {
      const LayoutManagerClass =
        (this.props.numColumns ?? 1) > 1 && !this.props.horizontal
          ? RVGridLayoutManagerImpl
          : RVLinearLayoutManagerImpl;
      // TODO: Check if params can just be forwarded
      const newLayoutManager = new LayoutManagerClass({
        windowSize,
        maxColumns: this.props.numColumns ?? 1,
        matchHeightsWithNeighbours: true,
        horizontal: this.props.horizontal,
      });
      this.layoutManager = newLayoutManager;
      this.startRender();
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
    if (this.isFirstLayoutComplete) {
      return this.viewabilityManager.getVisibleIndices();
    } else {
      return this.layoutManager.getVisibleLayouts(
        this.getLastScrollOffset(),
        this.layoutManager.getWindowsSize().height
      );
    }
  }

  modifyChildrenLayout(layoutInfo: RVLayoutInfo[], dataLength: number) {
    this.layoutManager?.modifyLayout(layoutInfo, dataLength);
    if (this.getIsFirstLayoutComplete()) {
      this.recomputeEngagedIndices();
    } else {
      this.resumeProgressiveRender();
    }
  }
}
