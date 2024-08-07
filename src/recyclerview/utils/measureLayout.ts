import { View } from "react-native";

export function measureLayout(view: View) {
  const layout = { x: 0, y: 0, width: 0, height: 0 };
  view.measureInWindow((x, y, width, height) => {
    layout.x = x;
    layout.y = y;
    layout.width = width;
    layout.height = height;
  });
  return layout;
}
