const ExceptionList = {
  refreshBooleanMissing: {
    message:
      "`refreshing` prop must be set as a boolean in order to use `onRefresh`, but got `undefined`.",
    type: "InvariantViolation",
  },
  stickyWhileHorizontalNotSupported: {
    message:
      "sticky headers are not supported when list is in horizontal mode. Remove `stickyHeaderIndices` prop.",
    type: "NotSupportedException",
  },
  columnsWhileHorizontalNotSupported: {
    message:
      "numColumns is not supported when list is in horizontal mode. Please remove or set numColumns to 1.",
    type: "NotSupportedException",
  },
  multipleViewabilityThresholdTypesNotSupported: {
    message:
      "You can set exactly one of itemVisiblePercentThreshold or viewAreaCoveragePercentThreshold. Specifying both is not supported.",
    type: "MultipleViewabilityThresholdTypesException",
  },
  overrideItemLayoutRequiredForMasonryOptimization: {
    message:
      "optimizeItemArrangement has been enabled on `MasonryFlashList` but overrideItemLayout is not set.",
    type: "InvariantViolation",
  },
};
export default ExceptionList;
