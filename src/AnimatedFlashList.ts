import { Animated } from "react-native";

import FlashList from "./FlashList";
import { FlashListProps } from "./FlashListProps";

const AnimatedFlashList =
  Animated.createAnimatedComponent<React.ComponentType<FlashListProps<any>>>(
    FlashList
  );

export default AnimatedFlashList;
