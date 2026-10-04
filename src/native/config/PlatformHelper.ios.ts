import { isRN083OrAbove } from "./versionCheck";

const PlatformConfig = {
  defaultDrawDistance: 250,
  nativeMvcpBreaksSnapFling: false,
  supportsOffsetCorrection: true,
  trackAverageRenderTimeForOffsetProjection: false,
  isRN083OrAbove: isRN083OrAbove(),
  invertedTransformStyle: { transform: [{ scaleY: -1 }] } as const,
  invertedTransformStyleHorizontal: { transform: [{ scaleX: -1 }] } as const,
};

export { PlatformConfig };
