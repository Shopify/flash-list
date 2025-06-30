import { Animated } from "react-native";

import { FlashListProps } from "./FlashListProps";
import { FlashList } from "./FlashList";

// Typecast as required
const AnimatedFlashList =
  Animated.createAnimatedComponent<React.ComponentType<FlashListProps<any>>>(
    FlashList
  );

export default AnimatedFlashList;
