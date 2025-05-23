/**
 * ScrollAnchor component provides a mechanism to programmatically scroll
 * the list by manipulating an invisible anchor element's position.
 * This helps us use ScrollView's maintainVisibleContentPosition property
 * to adjust the scroll position of the list as the size of content changes without any glitches.
 */

import React, { useImperativeHandle, useMemo, useState } from "react";

import { CompatView } from "./CompatView";

/**
 * Props for the ScrollAnchor component
 */
export interface ScrollAnchorProps {
  /** Ref to access scroll anchor methods */
  scrollAnchorRef: React.Ref<ScrollAnchorRef>;
  horizontal: boolean;
}

/**
 * Ref interface for ScrollAnchor component
 */
export interface ScrollAnchorRef {
  /** Scrolls the list by the specified offset */
  scrollBy: (offset: number) => void;
}

/**
 * ScrollAnchor component that provides programmatic scrolling capabilities using maintainVisibleContentPosition property
 * @param props - Component props
 * @returns An invisible anchor element used for scrolling
 */
export function ScrollAnchor({
  scrollAnchorRef,
  horizontal,
}: ScrollAnchorProps) {
  const [scrollOffset, setScrollOffset] = useState(1000000); // TODO: Fix this value

  // Expose scrollBy method through ref
  useImperativeHandle(
    scrollAnchorRef,
    () => ({
      scrollBy: (offset: number) => {
        setScrollOffset((prev) => prev + offset);
      },
    }),
    []
  );

  // Create an invisible anchor element that can be positioned
  const anchor = useMemo(() => {
    return (
      <CompatView
        style={{
          position: "absolute",
          height: 0,
          top: horizontal ? 0 : scrollOffset,
          left: horizontal ? scrollOffset : 0,
        }}
      />
    );
  }, [scrollOffset, horizontal]);

  return anchor;
}
