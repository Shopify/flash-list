// eslint-disable-next-line import/no-named-default
import { default as OriginalFlashList } from "./FlashList";
import { isNewCoreEnabled } from "./enableNewCore";
import { RecyclerView } from "./recyclerview/RecyclerView";

// Keep this unmodified for TS type checking
export { default as FlashList } from "./FlashList";
export { FlashListRef } from "./FlashListRef";
export {
  FlashListProps,
  ContentStyle,
  ListRenderItem,
  ListRenderItemInfo,
  RenderTarget,
  RenderTargetOptions,
} from "./FlashListProps";
export { default as AnimatedFlashList } from "./AnimatedFlashList";
export {
  useOnNativeBlankAreaEvents,
  BlankAreaEventHandler,
  BlankAreaEvent,
} from "./native/auto-layout/AutoLayoutView";
export {
  useBenchmark,
  BenchmarkParams,
  BenchmarkResult,
} from "./benchmark/useBenchmark";
export { useDataMultiplier } from "./benchmark/useDataMultiplier";
export {
  useFlatListBenchmark,
  FlatListBenchmarkParams,
} from "./benchmark/useFlatListBenchmark";
export {
  useBlankAreaTracker,
  BlankAreaTrackerResult,
  BlankAreaTrackerConfig,
} from "./benchmark/useBlankAreaTracker";
export {
  MasonryFlashList,
  MasonryFlashListProps,
  MasonryFlashListScrollEvent,
  MasonryFlashListRef,
  MasonryListItem,
  MasonryListRenderItem,
  MasonryListRenderItemInfo,
} from "./MasonryFlashList";
export { useLayoutState } from "./recyclerview/hooks/useLayoutState";
export { useRecyclingState } from "./recyclerview/hooks/useRecyclingState";
export { useMappingHelper } from "./recyclerview/hooks/useMappingHelper";
export { JSFPSMonitor, JSFPSResult } from "./benchmark/JSFPSMonitor";
export { autoScroll, Cancellable } from "./benchmark/AutoScrollHelper";
export { default as ViewToken } from "./viewability/ViewToken";
export { default as CellContainer } from "./native/cell-container/CellContainer";
export { RecyclerView } from "./recyclerview/RecyclerView";
export { RecyclerViewProps } from "./recyclerview/RecyclerViewProps";
export { useRecyclerViewContext } from "./recyclerview/RecyclerViewContextProvider";

// @ts-ignore - This is ignored by TypeScript but will be present in the compiled JS
// In the compiled JS, this will override the previous FlashList export with a conditional one
if (
  typeof module !== "undefined" &&
  module.exports &&
  process?.env?.NODE_ENV !== "test"
) {
  Object.defineProperty(module.exports, "FlashList", {
    get() {
      return isNewCoreEnabled() ? RecyclerView : OriginalFlashList;
    },
    configurable: true,
  });
}
