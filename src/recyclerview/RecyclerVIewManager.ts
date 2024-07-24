import { RVDimension, RVLayoutManager } from "./LayoutManager";
import { RecycleKeyManagerImpl, RecycleKeyManager } from "./RecycleKeyManager";
import {
  RVViewabilityManager,
  RVViewabilityManagerImpl,
} from "./ViewabilityManager";

export class RecyclerViewManager {
  INITIAL_NUM_TO_RENDER = 1;
  private viewabilityManager: RVViewabilityManager;
  private recycleKeyManager: RecycleKeyManager;
  private layoutManager: RVLayoutManager;
  private windowSize: RVDimension;
  // Map of index to key
  private renderStack: Map<number, string> = new Map();

  constructor() {
    this.viewabilityManager = new RVViewabilityManagerImpl();
    this.viewabilityManager.setOnEngagedIndicesChangedListener(
      this.updateRenderStack
    );
    this.recycleKeyManager = new RecycleKeyManagerImpl();
    this.startInitialRender();
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
        "type1",
        index.toString(),
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
  };

  updateLayoutManager(layoutManager: RVLayoutManager, windowSize: RVDimension) {
    this.layoutManager = layoutManager;
    this.windowSize = windowSize;
  }

  updateScrollOffset(offset: number) {
    this.viewabilityManager.updateScrollOffset(
      offset,
      this.layoutManager,
      this.windowSize
    );
  }

  // TODO
  completeFirstRender(lastMeasuredIndex: number) {
    if (this.layoutManager) {
      const layout = this.layoutManager.getLayout(lastMeasuredIndex);
      const isWindowFilled = this.windowSize.height <= layout.y + layout.height;
      if (!isWindowFilled) {
        this.updateRenderStack(
          new Array(++this.INITIAL_NUM_TO_RENDER).fill(0).map((_, i) => i)
        );
        return false;
      }
    }
    return true;
  }

  startInitialRender() {
    this.updateRenderStack(
      new Array(this.INITIAL_NUM_TO_RENDER).fill(0).map((_, i) => i)
    );
  }

  refresh() {
    this.viewabilityManager.updateScrollOffset(
      this.viewabilityManager.getScrollOffset(),
      this.layoutManager,
      this.windowSize
    );
  }

  getLayout(index: number) {
    return this.layoutManager.getLayout(index);
  }

  getRenderStack() {
    return this.renderStack;
  }

  getWindowSize() {
    return this.windowSize;
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
}
