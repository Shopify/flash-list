import { isRN083OrAbove } from "./versionCheck";

const PlatformConfig = {
  defaultDrawDistance: 250,
  supportsOffsetCorrection: true,
  trackAverageRenderTimeForOffsetProjection: true,
  isRN083OrAbove: isRN083OrAbove(),
  // Use scaleY/scaleX to invert (matching iOS and web) so the native scrollbar
  // stays on the correct edge. The previous `rotate("180deg")` workaround also
  // mirrored the horizontal axis, which pushed the scrollbar to the wrong side
  // (https://github.com/Shopify/flash-list/issues/751). `rotate` was originally
  // chosen for v1 scroll performance, but that jank came from native subview
  // clipping; v2 disables it (`removeClippedSubviews={false}`), so scaleY no
  // longer regresses scrolling.
  invertedTransformStyle: { transform: [{ scaleY: -1 }] } as const,
  invertedTransformStyleHorizontal: { transform: [{ scaleX: -1 }] } as const,
};

export { PlatformConfig };
