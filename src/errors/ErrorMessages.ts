export const ErrorMessages = {
  multipleViewabilityThresholdTypesNotSupported:
    "You can set exactly one of itemVisiblePercentThreshold or viewAreaCoveragePercentThreshold. Specifying both is not supported.",
  flashListV2OnlySupportsNewArchitecture:
    "FlashList v2 is only supported on new architecture",
  layoutManagerNotInitializedLayoutInfo:
    "LayoutManager is not initialized, layout info is unavailable",
  layoutManagerNotInitializedChildContainer:
    "LayoutManager is not initialized, child container layout is unavailable",
  layoutManagerNotInitializedWindowSize:
    "LayoutManager is not initialized, window size is unavailable",
  horizontalPropCannotBeToggled:
    "Horizontal prop cannot be toggled, you can use a key on FlashList to recreate it.",
  layoutManagerNotInitializedVisibleIndices:
    "LayoutManager is not initialized, visible indices are not unavailable",
  masonryAndHorizontalIncompatible:
    "Masonry and horizontal props are incompatible",
  numColumnsAndHorizontalIncompatible:
    "numColumns and horizontal props are incompatible",
  indexOutOfBounds: "index out of bounds, not enough layouts",
  fpsMonitorAlreadyRunning:
    "This FPS Monitor has already been run, please create a new instance",
  dataEmptyCannotRunBenchmark: "Data is empty, cannot run benchmark",
  stickyHeadersNotSupportedForHorizontal:
    "Sticky headers are not supported when list is horizontal",
};
