import { PlatformConfig } from "../../native/config/PlatformHelper";

export function getInvertedTransformStyle(
  inverted?: boolean | null,
  horizontal?: boolean | null
) {
  if (!inverted) return undefined;
  return horizontal
    ? PlatformConfig.invertedTransformStyleHorizontal
    : PlatformConfig.invertedTransformStyle;
}
