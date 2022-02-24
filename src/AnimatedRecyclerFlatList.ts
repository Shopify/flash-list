import { Animated } from "react-native";

import RecyclerFlatList, { RecyclerFlatListProps } from "./RecyclerFlatList";

const AnimatedRecyclerFlatList =
  Animated.createAnimatedComponent<
    React.ComponentType<RecyclerFlatListProps<any>>
  >(RecyclerFlatList);

export default AnimatedRecyclerFlatList;
