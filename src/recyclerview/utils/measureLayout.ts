import { View } from "react-native";

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

export function areDimensionsNotEqual(value1: number, value2: number): boolean {
  return Math.abs(value1 - value2) > 1;
}

export function areDimensionsEqual(value1: number, value2: number): boolean {
  return Math.abs(value1 - value2) <= 1;
}
