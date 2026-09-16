import { RefObject, useEffect } from "react";

import { CompatScroller } from "../components/CompatScroller";

/**
 * On web an inverted list is flipped with transform: scaleY(-1) (scaleX(-1)
 * when horizontal). The native mouse wheel is not flipped, so it scrolls the
 * opposite way. Re-invert the wheel delta on the scroll node. Setting scrollTop
 * fires the scroll event, so virtualization keeps working.
 */
export function useInvertedWheelFix(
  scrollViewRef: RefObject<CompatScroller>,
  inverted: boolean | null | undefined,
  horizontal: boolean | null | undefined
): void {
  useEffect(() => {
    if (!inverted) return;
    const scrollNode = scrollViewRef.current?.getScrollableNode?.() as
      | HTMLElement
      | undefined;
    if (!scrollNode?.addEventListener) return;

    const onWheel = (event: WheelEvent) => {
      if (horizontal) {
        if (!event.deltaX) return;
        event.preventDefault();
        scrollNode.scrollLeft -= event.deltaX;
      } else {
        if (!event.deltaY) return;
        event.preventDefault();
        scrollNode.scrollTop -= event.deltaY;
      }
    };

    scrollNode.addEventListener("wheel", onWheel, { passive: false });
    return () => scrollNode.removeEventListener("wheel", onWheel);
  }, [scrollViewRef, inverted, horizontal]);
}
