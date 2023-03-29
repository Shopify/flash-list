import type { ReactNode } from "react";
import {
  Platform,
  requireNativeComponent,
  UIManager,
  ViewStyle,
} from "react-native";

const LINKING_ERROR =
  `The package 'react-native-bidirectional-flatlist' doesn't seem to be linked. Make sure: \n\n${Platform.select(
    {
      ios: "- You have run 'pod install'\n",
      default: "",
    }
  )}- You rebuilt the app after installing the package\n` +
  `- You are not using Expo managed workflow\n`;

interface BidirectionalFlatlistProps {
  style: ViewStyle;
  children: ReactNode;
}

const ComponentName = "DoubleSidedScrollView";

export const BidirectionalFlatlist =
  Platform.OS === "android"
    ? UIManager.getViewManagerConfig(ComponentName) != null
      ? requireNativeComponent<BidirectionalFlatlistProps>(ComponentName)
      : () => {
          throw new Error(LINKING_ERROR);
        }
    : null;
