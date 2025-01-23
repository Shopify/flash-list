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
  addInvertedWheelHandler: (
    ref: RecyclerListView<RecyclerListViewProps, any> | undefined
  ): (() => void) | undefined => {
    // (web-only)
    return undefined;
  },
  removeInvertedWheelHandler: (
    ref: RecyclerListView<RecyclerListViewProps, any> | undefined
  ): (() => void) | undefined => {
    // (web-only)
    return undefined;
  },
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

export {
  PlatformConfig,
  getCellContainerPlatformStyles,
  getItemAnimator,
  getFooterContainer,
};
