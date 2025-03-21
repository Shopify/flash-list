import { useImperativeHandle, useMemo, useRef, useState } from "react";
import { CompatView } from "./CompatView";
import React from "react";

export interface ScrollAnchorProps {
  scrollAnchorRef: React.Ref<ScrollAnchorRef>;
}
export interface ScrollAnchorRef {
  scrollBy: (offset: number) => void;
}
export function ScrollAnchor({ scrollAnchorRef }: ScrollAnchorProps) {
  const [scrollOffset, setScrollOffset] = useState(50);
  useImperativeHandle(scrollAnchorRef, () => ({
    scrollBy: (offset: number) => {
      //console.log("scrollBy", offset);
      setScrollOffset((prev) => prev - offset);
    },
  }));
  const anchor = useMemo(() => {
    return (
      <CompatView
        style={{ position: "absolute", height: 0, top: scrollOffset }}
      />
    );
  }, [scrollOffset]);

  return anchor;
}
