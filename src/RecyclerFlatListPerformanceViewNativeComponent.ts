import { requireNativeComponent } from "react-native";

interface OnInteractiveEvent {
  nativeEvent: {
    timestamp: number;
  };
}

type OnInteractiveHandler = (event: OnInteractiveEvent) => void;

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
