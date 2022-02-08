import { requireNativeComponent } from "react-native";

interface OnInteractiveEvent {
  nativeEvent: {
    timestamp: number;
  };
}

type OnInteractiveHandler = (event: OnInteractiveEvent) => void;

interface RecyclerFlatListPerformanceViewNativeComponentProps {
  onInteractive: OnInteractiveHandler;
}

const RecyclerFlatListPerformanceViewNativeComponent =
  requireNativeComponent<RecyclerFlatListPerformanceViewNativeComponentProps>(
    "RecyclerFlatListPerformanceView"
  );
export { RecyclerFlatListPerformanceViewNativeComponent };
