import { isRN083OrAbove } from "./versionCheck";

const PlatformConfig = {
  defaultDrawDistance: 250,
  supportsOffsetCorrection: true,
  trackAverageRenderTimeForOffsetProjection: true,
  isRN083OrAbove: isRN083OrAbove(),
  // Using rotate instead of scaleY on Android to avoid performance issues.
  // Caveat: this causes the scrollbar to appear on the left side.
  // Issue: https://github.com/Shopify/flash-list/issues/751
  invertedTransformStyle: { transform: [{ rotate: "180deg" }] } as const,
  invertedTransformStyleHorizontal: {
    transform: [{ rotate: "180deg" }],
  } as const,
};

export { PlatformConfig };
