let useNewCore: boolean | undefined;
export function enableNewCore(enable: boolean) {
  useNewCore = enable;
}

export function isNewCoreEnabled() {
  return useNewCore ?? isReactNativeNewArchitecture();
}

function isReactNativeNewArchitecture(): boolean {
  try {
    // Check for Fabric UI Manager
    const hasFabricUIManager = Boolean((global as any)?.nativeFabricUIManager);

    // Check for TurboModule system
    const hasTurboModule = Boolean((global as any)?.__turboModuleProxy);

    return hasFabricUIManager || hasTurboModule;
  } catch {
    return false;
  }
}
