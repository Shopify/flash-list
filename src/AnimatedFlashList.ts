import { Animated } from "react-native";

import { FlashListProps } from "./FlashListProps";
import { RecyclerView } from "./recyclerview/RecyclerView";

// Typecast as required
const AnimatedFlashList =
  Animated.createAnimatedComponent<React.ComponentType<FlashListProps<any>>>(
    RecyclerView
  );

export default AnimatedFlashList;
