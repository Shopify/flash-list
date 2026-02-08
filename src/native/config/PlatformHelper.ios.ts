import { isRN083OrAbove } from "./versionCheck";

const PlatformConfig = {
  defaultDrawDistance: 250,
  supportsOffsetCorrection: true,
  trackAverageRenderTimeForOffsetProjection: false,
  isRN083OrAbove: isRN083OrAbove(),
};

export { PlatformConfig };
