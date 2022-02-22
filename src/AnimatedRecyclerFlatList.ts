import { Animated } from "react-native";

import { RecyclerFlatList } from ".";

const AnimatedRecyclerFlatList =
  Animated.createAnimatedComponent(RecyclerFlatList);

export default AnimatedRecyclerFlatList;
