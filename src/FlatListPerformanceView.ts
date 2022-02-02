import { requireNativeComponent } from "react-native";

/**
 * Wrap FlatList with this view to get reports of blank spaces
 */
const FlatListPerformanceView = requireNativeComponent(
  "FlatListPerformanceView"
);
export default FlatListPerformanceView;
