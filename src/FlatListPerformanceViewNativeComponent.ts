import { requireNativeComponent } from "react-native";

interface OnInteractiveEvent {
  nativeEvent: {
    timestamp: number;
  };
}

type OnInteractiveHandler = (event: OnInteractiveEvent) => void;

interface FlatListPerformanceViewProps {
  onInteractive: OnInteractiveHandler;
}

/**
 * Wrap FlatList with this view to get reports of blank spaces
 */
const FlatListPerformanceView =
  requireNativeComponent<FlatListPerformanceViewProps>(
    "FlatListPerformanceView"
  );
export { FlatListPerformanceView as FlatListPerformanceViewNativeComponent };
