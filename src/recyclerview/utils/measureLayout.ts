import { PixelRatio, View } from "react-native";

export function measureLayout(view: View) {
  const layout = { x: 0, y: 0, width: 0, height: 0 };
  view.measureLayout(view, (x, y, width, height) => {
    layout.x = x;
    layout.y = y;
    layout.width = PixelRatio.roundToNearestPixel(width);
    layout.height = PixelRatio.roundToNearestPixel(height);
  });
  return layout;
}

export function areDimensionsNotEqual(value1: number, value2: number): boolean {
  return (
    PixelRatio.roundToNearestPixel(value1) !==
    PixelRatio.roundToNearestPixel(value2)
  );
}
