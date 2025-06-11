import { ScrollView, Animated } from "react-native";

const AnimatedScrollView = Animated.ScrollView;

/** Regular scroll view component */
export { ScrollView as CompatScroller };

/** Animated scroll view component for smooth scrolling animations */
export { AnimatedScrollView as CompatAnimatedScroller };
