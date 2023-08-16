/**
 * This file comes courtsey of steuerbot and their work on react-native-bidirectional-flatlist. Huge thanks for helping
 * solve this problem with fling!
 * */
import type { ReactNode } from "react";
import { Platform, requireNativeComponent, ViewStyle } from "react-native";

const LINKING_ERROR =
  `The package 'react-native-flashlist' doesn't seem to be linked. Make sure: \n\n${Platform.select(
    {
      ios: "- You have run 'pod install'\n",
      default: "",
    }
  )}- You rebuilt the app after installing the package\n` +
  `- You are not using Expo managed workflow\n`;

interface BidirectionalListProps {
  style: ViewStyle;
  children: ReactNode;
}

const ComponentName = "DoubleSidedScrollView";

const BidirectionalList =
  requireNativeComponent<BidirectionalListProps>(ComponentName);

if (BidirectionalList === null) {
  throw new Error(LINKING_ERROR);
}

export { BidirectionalList };
