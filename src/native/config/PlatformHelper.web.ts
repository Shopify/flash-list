import React from "react";
import { findNodeHandle, View } from "react-native";
import {
  BaseItemAnimator,
  RecyclerListView,
  RecyclerListViewProps,
} from "recyclerlistview";
import { DefaultJSItemAnimator } from "recyclerlistview/dist/reactnative/platform/reactnative/itemanimators/defaultjsanimator/DefaultJSItemAnimator";

const createInvertedWheelEventHandler = (type: "horizontal" | "vertical") => {
  return (event: globalThis.WheelEvent) => {
    const node = event.currentTarget as HTMLElement;

    const deltaX = type === "horizontal" ? -event.deltaX : event.deltaX;
    const deltaY = type === "vertical" ? -event.deltaY : event.deltaY;

    node.scrollBy({
      top: deltaY,
      left: deltaX,
      behavior: "auto",
    });

    event.preventDefault();
  };
};

const verticalInvertedWheelEventHandler =
  createInvertedWheelEventHandler("vertical");
const horizontalInvertedWheelEventHandler =
  createInvertedWheelEventHandler("horizontal");

const PlatformConfig = {
  defaultDrawDistance: 2000,
  invertedTransformStyle: { transform: [{ scaleY: -1 }] },
  invertedTransformStyleHorizontal: { transform: [{ scaleX: -1 }] },
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
const addInvertedWheelHandler = (
  ref: RecyclerListView<RecyclerListViewProps, any> | undefined,
  type: "horizontal" | "vertical"
): ((event: globalThis.WheelEvent) => void) | undefined => {
  if (!ref) return undefined;
  const node = findNodeHandle(ref) as unknown as HTMLElement;
  if (node) {
    const handler =
      type === "horizontal"
        ? horizontalInvertedWheelEventHandler
        : verticalInvertedWheelEventHandler;
    node.addEventListener("wheel", handler, {
      passive: false,
    });
    return handler;
  }
  return undefined;
};
const removeInvertedWheelHandler = (
  ref: RecyclerListView<RecyclerListViewProps, any> | undefined
): ((event: globalThis.WheelEvent) => void) | undefined => {
  if (!ref) return undefined;
  const node = findNodeHandle(ref) as unknown as HTMLElement;
  if (node) {
    node.removeEventListener("wheel", verticalInvertedWheelEventHandler);
    node.removeEventListener("wheel", horizontalInvertedWheelEventHandler);
  }
  return undefined;
};

export {
  PlatformConfig,
  getCellContainerPlatformStyles,
  getItemAnimator,
  getFooterContainer,
  addInvertedWheelHandler,
  removeInvertedWheelHandler,
};
