import { Animated } from "react-native";

import FlashList, { FlashListProps } from "./FlashList";

const AnimatedFlashList =
  Animated.createAnimatedComponent<React.ComponentType<FlashListProps<any>>>(
    FlashList
  );

export default AnimatedFlashList;
