import { BaseItemAnimator } from "recyclerlistview";

const PlatformConfig = {
  defaultDrawDistance: 250,
};
const getCellContainerPlatformStyles = (
  inverted: boolean,
  parentProps: { x: number; y: number }
): object | undefined => {
  return undefined;
};

const getItemAnimator = (): BaseItemAnimator | undefined => {
  return undefined;
};
export { PlatformConfig, getCellContainerPlatformStyles, getItemAnimator };
