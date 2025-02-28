import React from "react";
import { findNodeHandle, View } from "react-native";
import {
  BaseItemAnimator,
  RecyclerListView,
  RecyclerListViewProps,
} from "recyclerlistview";
import { DefaultJSItemAnimator } from "recyclerlistview/dist/reactnative/platform/reactnative/itemanimators/defaultjsanimator/DefaultJSItemAnimator";

/**
 * Checks if a wheel event should be handled by a nested scrollable element.
 */
const shouldNestedElementHandleScroll = (
  event: globalThis.WheelEvent
): boolean => {
  const targetNode = event.target;
  if (!(targetNode instanceof HTMLElement)) {
    return false;
  }

  let target: HTMLElement | null = targetNode;
  const currentTarget = event.currentTarget as HTMLElement;

  while (target && target !== currentTarget) {
    const style = window.getComputedStyle(target);
    const overflowY = style.overflowY;
    const overflowX = style.overflowX;

    const isScrollableY =
      overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay";
    const isScrollableX =
      overflowX === "auto" || overflowX === "scroll" || overflowX === "overlay";

    // Check if element should handle vertical scroll
    if (isScrollableY && target.scrollHeight > target.clientHeight) {
      if (
        (event.deltaY > 0 &&
          target.scrollTop < target.scrollHeight - target.clientHeight) ||
        (event.deltaY < 0 && target.scrollTop > 0)
      ) {
        return true;
      }
    }

    // Check if element should handle horizontal scroll
    if (isScrollableX && target.scrollWidth > target.clientWidth) {
      if (
        (event.deltaX > 0 &&
          target.scrollLeft < target.scrollWidth - target.clientWidth) ||
        (event.deltaX < 0 && target.scrollLeft > 0)
      ) {
        return true;
      }
    }

    target = target.parentElement;
  }

  return false;
};

const createInvertedWheelEventHandler = (type: "horizontal" | "vertical") => {
  return (event: globalThis.WheelEvent) => {
    if (shouldNestedElementHandleScroll(event)) {
      return;
    }

    const currentTarget = event.currentTarget as HTMLElement;
    const deltaX = type === "horizontal" ? -event.deltaX : event.deltaX;
    const deltaY = type === "vertical" ? -event.deltaY : event.deltaY;

    currentTarget.scrollBy({
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
