import { Platform } from "react-native";

const rnVersion = Platform.constants?.reactNativeVersion;

export const isRN083OrAbove = () =>
  rnVersion && (rnVersion.major > 0 || rnVersion.minor >= 83);
