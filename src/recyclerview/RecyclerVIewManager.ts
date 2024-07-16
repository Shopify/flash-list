import { RVLayoutManager } from "./LayoutManager";
import { RecycleKeyManagerImpl, RecycleKeyManager } from "./RecycleKeyManager";
import {
  RVViewabilityManager,
  RVViewabilityManagerImpl,
} from "./ViewabilityManager";

export class RecyclerViewManager {
  private viewabilityManager: RVViewabilityManager;
  private recycleKeyManager: RecycleKeyManager;
  private layoutManager: RVLayoutManager;
  constructor(layoutManager: RVLayoutManager) {
    this.layoutManager = layoutManager;
    this.viewabilityManager = new RVViewabilityManagerImpl(layoutManager);
    this.recycleKeyManager = new RecycleKeyManagerImpl();
  }
}
