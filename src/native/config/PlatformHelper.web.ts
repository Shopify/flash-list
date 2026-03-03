const PlatformConfig = {
  defaultDrawDistance: 500,
  supportsOffsetCorrection: false,
  trackAverageRenderTimeForOffsetProjection: false,
  isRN083OrAbove: true,
  invertedTransformStyle: { transform: [{ scaleY: -1 }] } as const,
  invertedTransformStyleHorizontal: { transform: [{ scaleX: -1 }] } as const,
};

export { PlatformConfig };
