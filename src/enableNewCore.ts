let useNewCore = false;
export function enableNewCore(enable: boolean) {
  useNewCore = enable;
}

export function isNewCoreEnabled() {
  return useNewCore;
}
