import type React from "react";
import { Animated } from "react-native";

import { FlashListProps } from "./FlashListProps";
import { FlashList } from "./FlashList";
import { FlashListRef } from "./FlashListRef";

// `createAnimatedComponent` drops FlashList's generic and ref, so restore both.
const AnimatedFlashList = Animated.createAnimatedComponent(
  FlashList
) as unknown as <T>(
  props: Animated.AnimatedProps<
    FlashListProps<T> & React.RefAttributes<FlashListRef<T>>
  >
) => React.ReactElement | null;

export default AnimatedFlashList;
