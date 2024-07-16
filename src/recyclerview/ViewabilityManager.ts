import { RVLayoutManager } from "./LayoutManager";

export interface RVViewabilityManager {
  updateScrollOffset: (offset: number, layoutManager: RVLayoutManager) => void;
  getVisibleIndices: () => number[];
  // can be used to get visible indices
  onVisibleIndicesChanged: (
    callback: (all: number[], now: number[], notNow: number[]) => void
  ) => void;
  // can be used to get indices that need to be rendered, includes render buffer
  onEngagedIndicesChanged: (
    callback: (all: number[], now: number[], notNow: number[]) => void
  ) => void;
  // get last updated offset
  getScrollOffset: () => number;
  // Adds render buffer, only impacts engaged indices
  updateRenderAheadOffset: (renderAheadOffset: number) => void;
}
