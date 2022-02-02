import { requireNativeComponent } from "react-native";

type OnInteractiveHandler = () => void;

interface RecyclerFlatListPerformanceViewProps {
  onInteractive: OnInteractiveHandler;
}

/**
 * Wrap RecyclerFlatList with this view to get reports of blank spaces
 */
const RecyclerFlatListPerformanceView =
  requireNativeComponent<RecyclerFlatListPerformanceViewProps>(
    "RecyclerFlatListPerformanceView"
  );
export { RecyclerFlatListPerformanceView as RecyclerFlatListPerformanceViewNativeComponent };
