import { requireNativeComponent } from "react-native";

type OnInteractiveHandler = () => void;

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
