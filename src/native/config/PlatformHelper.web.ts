import React from "react";
import { findNodeHandle, View } from "react-native";
import {
  BaseItemAnimator,
  RecyclerListView,
  RecyclerListViewProps,
} from "recyclerlistview";
import { DefaultJSItemAnimator } from "recyclerlistview/dist/reactnative/platform/reactnative/itemanimators/defaultjsanimator/DefaultJSItemAnimator";

const invertedWheelEventHandler = (event: globalThis.WheelEvent) => {
  const node = event.currentTarget as HTMLElement;

  // For inverted lists, we want to scroll in the opposite direction
  // So when deltaY is positive (scroll down), we want to scroll up
  const deltaY = -event.deltaY;
  const deltaX = -event.deltaX;

  // Scroll by the inverted delta
  node.scrollBy({
    top: deltaY,
    left: deltaX,
    behavior: "auto",
  });

  // Prevent the default scroll
  event.preventDefault();
};

const PlatformConfig = {
  defaultDrawDistance: 2000,
  invertedTransformStyle: { transform: [{ scaleY: -1 }] },
  invertedTransformStyleHorizontal: { transform: [{ scaleX: -1 }] },
  addInvertedWheelHandler: (
    ref: RecyclerListView<RecyclerListViewProps, any> | undefined
  ): ((event: globalThis.WheelEvent) => void) | undefined => {
    if (!ref) return undefined;
    const node = findNodeHandle(ref) as unknown as HTMLElement;
    if (node) {
      node.addEventListener("wheel", invertedWheelEventHandler, {
        passive: false,
      });
      return invertedWheelEventHandler;
    }
    return undefined;
  },
  removeInvertedWheelHandler: (
    ref: RecyclerListView<RecyclerListViewProps, any> | undefined
  ): ((event: globalThis.WheelEvent) => void) | undefined => {
    if (!ref) return undefined;
    const node = findNodeHandle(ref) as unknown as HTMLElement;
    if (node) {
      node.removeEventListener("wheel", invertedWheelEventHandler);
    }
    return undefined;
  },
};
const getCellContainerPlatformStyles = (
  inverted: boolean,
  parentProps: { x: number; y: number; isHorizontal?: boolean }
): { transform: string; WebkitTransform: string } | undefined => {
  const transformValue = `translate(${parentProps.x}px,${parentProps.y}px)${
    inverted ? ` ${parentProps.isHorizontal ? `scaleX` : `scaleY`}(-1)` : ``
  }`;
  return { transform: transformValue, WebkitTransform: transformValue };
};

const getItemAnimator = (): BaseItemAnimator | undefined => {
  return new DefaultJSItemAnimator();
};

const getFooterContainer = (): React.ComponentClass | undefined => {
  return View;
};

export {
  PlatformConfig,
  getCellContainerPlatformStyles,
  getItemAnimator,
  getFooterContainer,
};
