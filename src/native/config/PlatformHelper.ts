import {
  BaseItemAnimator,
  RecyclerListView,
  RecyclerListViewProps,
} from "recyclerlistview";
import { DefaultJSItemAnimator } from "recyclerlistview/dist/reactnative/platform/reactnative/itemanimators/defaultjsanimator/DefaultJSItemAnimator";

const PlatformConfig = {
  defaultDrawDistance: 250,
  invertedTransformStyle: { transform: [{ scaleY: -1 }] },
  invertedTransformStyleHorizontal: { transform: [{ scaleX: -1 }] },
};
const getCellContainerPlatformStyles = (
  inverted: boolean,
  parentProps: { x: number; y: number; isHorizontal?: boolean }
): { transform: string; WebkitTransform: string } | undefined => {
  return undefined;
};

const getItemAnimator = (): BaseItemAnimator | undefined => {
  return new DefaultJSItemAnimator();
};

const getFooterContainer = (): React.ComponentClass | undefined => {
  return undefined;
};

const addInvertedWheelHandler = (
  ref: RecyclerListView<RecyclerListViewProps, any> | undefined,
  type: "horizontal" | "vertical"
): (() => void) | undefined => {
  return undefined;
};

const removeInvertedWheelHandler = (
  ref: RecyclerListView<RecyclerListViewProps, any> | undefined
): (() => void) | undefined => {
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
