import { requireNativeComponent } from "react-native";

/**
 * Wrap RecyclerFlatList with this view to get reports of blank spaces
 */
const RecyclerFlatListPerformanceView = requireNativeComponent(
  "RecyclerFlatListPerformanceView"
);
export default RecyclerFlatListPerformanceView;
