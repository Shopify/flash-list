import { RefObject } from "react";

import { CompatScroller } from "../components/CompatScroller";

/**
 * Inverted lists only need a mouse-wheel direction fix on web. No-op native.
 * See useInvertedWheelFix.web.ts.
 */
export function useInvertedWheelFix(
  scrollViewRef: RefObject<CompatScroller>,
  inverted: boolean | null | undefined,
  horizontal: boolean | null | undefined
): void {}
