import { PixelRatio, View } from "react-native";

// unstable_getBoundingClientRect is not part of the official RN View type yet
type ViewWithBoundingClientRect = View & {
  unstable_getBoundingClientRect?: () => {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

interface Layout {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Size {
  width: number;
  height: number;
}

/**
 * Measures the layout of a view relative to itselft.
 * Using measure wasn't returing accurate values but this workaround does.
 * Returns the x, y coordinates and dimensions of the view.
 *
 * @param view - The React Native View component to measure
 * @returns An object containing x, y, width, and height measurements
 */
function measureLayout(view: View, oldLayout: Layout | undefined) {
  // On Android New Architecture (RN 0.78+), View.measureLayout() invokes its
  // callback asynchronously, so by the time we return `layout` the values are
  // still {0,0,0,0}.  unstable_getBoundingClientRect() reads directly from the
  // Fabric shadow tree and is synchronous, so use it when available.
  const viewWithRect = view as ViewWithBoundingClientRect;
  if (typeof viewWithRect.unstable_getBoundingClientRect === "function") {
    const rect = viewWithRect.unstable_getBoundingClientRect();
    const layout: Layout = {
      x: rect.x ?? 0,
      y: rect.y ?? 0,
      width: roundOffPixel(rect.width ?? 0),
      height: roundOffPixel(rect.height ?? 0),
    };
    if (oldLayout) {
      if (areDimensionsEqual(layout.width, oldLayout.width)) {
        layout.width = oldLayout.width;
      }
      if (areDimensionsEqual(layout.height, oldLayout.height)) {
        layout.height = oldLayout.height;
      }
    }
    return layout;
  }
  return measureLayoutRelative(view, view, oldLayout);
}

/**
 * Measures the layout of a view relative to another view.
 * Useful for measuring positions relative to a specific reference view.
 *
 * @param view - The React Native View component to measure
 * @param relativeTo - The reference view to measure against
 * @returns An object containing x, y, width, and height measurements
 */
function measureLayoutRelative(
  view: View,
  relativeTo: View,
  oldLayout: Layout | undefined
) {
  const layout = { x: 0, y: 0, width: 0, height: 0 };
  view.measureLayout(relativeTo, (x, y, width, height) => {
    layout.x = x;
    layout.y = y;
    layout.width = roundOffPixel(width);
    layout.height = roundOffPixel(height);
  });

  if (oldLayout) {
    if (areDimensionsEqual(layout.width, oldLayout.width)) {
      layout.width = oldLayout.width;
    }
    if (areDimensionsEqual(layout.height, oldLayout.height)) {
      layout.height = oldLayout.height;
    }
  }
  return layout;
}

/**
 * Checks if two dimension values are not equal, with a small tolerance.
 * Used to handle floating-point precision issues in layout measurements.
 *
 * @param value1 - First dimension value to compare
 * @param value2 - Second dimension value to compare
 * @returns true if the values are significantly different, false otherwise
 */
export function areDimensionsNotEqual(value1: number, value2: number): boolean {
  return !areDimensionsEqual(value1, value2);
}

/**
 * Checks if two dimension values are equal, with a small tolerance.
 * Used to handle floating-point precision issues in layout measurements.
 *
 * @param value1 - First dimension value to compare
 * @param value2 - Second dimension value to compare
 * @returns true if the values are approximately equal, false otherwise
 */
export function areDimensionsEqual(value1: number, value2: number): boolean {
  return (
    Math.abs(
      PixelRatio.getPixelSizeForLayoutSize(value1) -
        PixelRatio.getPixelSizeForLayoutSize(value2)
    ) <= 1
  );
}

export function roundOffPixel(value: number): number {
  return PixelRatio.roundToNearestPixel(value);
}

/**
 * Measures the size of the RecyclerView's outer container.
 * Uses a self-relative measureLayout call to get width/height synchronously.
 *
 * @param view - The React Native View component to measure
 * @returns An object containing width and height
 */
export function measureParentSize(view: View): Size {
  const layout = measureLayout(view, undefined);
  return { width: layout.width, height: layout.height };
}

/**
 * Specific method for easier mocking
 * Measures the layout of child container of RecyclerView
 * @param childContainerView
 * @param parentView
 * @returns
 */
export function measureFirstChildLayout(
  childContainerView: View,
  parentView: View
): Layout {
  return measureLayoutRelative(childContainerView, parentView, undefined);
}

/**
 * Specific method for easier mocking
 * Measures the layout of items of RecyclerView
 * @param item
 * @param oldLayout
 * @returns
 */
export function measureItemLayout(
  item: View,
  oldLayout: Layout | undefined
): Layout {
  return measureLayout(item, oldLayout);
}
