import { View } from "react-native";

/**
 * Measures the layout of a view relative to itselft.
 * Using measure wasn't returing accurate values but this workaround does.
 * Returns the x, y coordinates and dimensions of the view.
 *
 * @param view - The React Native View component to measure
 * @returns An object containing x, y, width, and height measurements
 */
export function measureLayout(view: View) {
  const layout = { x: 0, y: 0, width: 0, height: 0 };
  view.measureLayout(view, (x, y, width, height) => {
    layout.x = x;
    layout.y = y;
    layout.width = width;
    layout.height = height;
  });
  return layout;
}

/**
 * Measures the layout of a view relative to another view.
 * Useful for measuring positions relative to a specific reference view.
 *
 * @param view - The React Native View component to measure
 * @param relativeTo - The reference view to measure against
 * @returns An object containing x, y, width, and height measurements
 */
export function measureLayoutRelative(view: View, relativeTo: View) {
  const layout = { x: 0, y: 0, width: 0, height: 0 };
  view.measureLayout(relativeTo, (x, y, width, height) => {
    layout.x = x;
    layout.y = y;
    layout.width = width;
    layout.height = height;
  });
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
  return Math.abs(value1 - value2) > 1;
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
  return Math.abs(value1 - value2) <= 1;
}
