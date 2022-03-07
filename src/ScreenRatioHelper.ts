import { PixelRatio, Dimensions } from "react-native";

export const screenSizeRatioToPixels = (
  ratio: number,
  isHorizontal: boolean
) => {
  const screenSize =
    isHorizontal === true
      ? Dimensions.get("window").width
      : Dimensions.get("window").height;
  const screenSizePixels = PixelRatio.getPixelSizeForLayoutSize(screenSize);
  return screenSizePixels * ratio;
};
