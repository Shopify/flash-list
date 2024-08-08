import { RVLayoutManager } from "./LayoutManager";
import { RecycleKeyManagerImpl, RecycleKeyManager } from "./RecycleKeyManager";
import {
  RVViewabilityManager,
  RVViewabilityManagerImpl,
} from "./ViewabilityManager";

export class RecyclerViewManager {
  INITIAL_NUM_TO_RENDER = 1;
  private viewabilityManager: RVViewabilityManager;
  private recycleKeyManager: RecycleKeyManager;
  private layoutManager?: RVLayoutManager;
  // Map of index to key
  private renderStack: Map<number, string> = new Map();
  private onRenderStackChanged: (renderStack: Map<number, string>) => void;
  private onFirstLayoutComplete: () => void;
  private isFirstLayoutComplete = false;
  private stableIdProvider: (index: number) => string;
  private getItemType: (index: number) => string;

  constructor(
    onRenderStackChanged: (renderStack: Map<number, string>) => void,
    onFirstLayoutComplete: () => void
  ) {
    this.onRenderStackChanged = onRenderStackChanged;
    this.onFirstLayoutComplete = onFirstLayoutComplete;
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
        this.onFirstLayoutComplete();
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

  refresh() {
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

  getViewabilityManager() {
    return this.viewabilityManager;
  }

  getLayoutManager() {
    return this.layoutManager;
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
}
