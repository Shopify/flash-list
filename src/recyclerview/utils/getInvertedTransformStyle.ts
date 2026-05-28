import { PlatformConfig } from "../../native/config/PlatformHelper";

export function getInvertedTransformStyle(horizontal?: boolean | null) {
  return horizontal
    ? PlatformConfig.invertedTransformStyleHorizontal
    : PlatformConfig.invertedTransformStyle;
}
