import { Platform } from "react-native";

let _isNewArch: boolean | undefined;

export function isNewArch(): boolean {
  if (_isNewArch !== undefined) {
    return _isNewArch;
  } else {
    try {
      // Check for Fabric UI Manager
      const hasFabricUIManager = Boolean(
        (global as any)?.nativeFabricUIManager
      );

      // Check for TurboModule system
      const hasTurboModule = Boolean((global as any)?.__turboModuleProxy);

      _isNewArch =
        hasFabricUIManager || hasTurboModule || Platform.OS === "web";
    } catch {
      _isNewArch = true;
    }
  }
  return _isNewArch;
}
