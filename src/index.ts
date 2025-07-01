// Keep this unmodified for TS type checking
import { isNewArch } from "./isNewArch";
import { ErrorMessages } from "./errors/ErrorMessages";

export { FlashList } from "./FlashList";
export { FlashListRef } from "./FlashListRef";
export {
  FlashListProps,
  ListRenderItem,
  ListRenderItemInfo,
  RenderTarget,
  RenderTargetOptions,
} from "./FlashListProps";
export { default as AnimatedFlashList } from "./AnimatedFlashList";
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
export { useLayoutState } from "./recyclerview/hooks/useLayoutState";
export { useRecyclingState } from "./recyclerview/hooks/useRecyclingState";
export { useMappingHelper } from "./recyclerview/hooks/useMappingHelper";
export { JSFPSMonitor, JSFPSResult } from "./benchmark/JSFPSMonitor";
export { autoScroll, Cancellable } from "./benchmark/AutoScrollHelper";
export { default as ViewToken } from "./recyclerview/viewability/ViewToken";
export { useFlashListContext } from "./recyclerview/RecyclerViewContextProvider";
export {
  LayoutCommitObserver,
  LayoutCommitObserverProps,
} from "./recyclerview/LayoutCommitObserver";

if (!isNewArch()) {
  throw new Error(ErrorMessages.flashListV2OnlySupportsNewArchitecture);
}
