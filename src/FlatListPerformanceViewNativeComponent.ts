import { requireNativeComponent } from "react-native";

interface OnInteractiveEvent {
  nativeEvent: {
    timestamp: number;
  };
}

type OnInteractiveHandler = (event: OnInteractiveEvent) => void;

interface FlatListPerformanceViewNativeComponentProps {
  onInteractive: OnInteractiveHandler;
}

const FlatListPerformanceViewNativeComponent =
  requireNativeComponent<FlatListPerformanceViewNativeComponentProps>(
    "FlatListPerformanceView"
  );
export { FlatListPerformanceViewNativeComponent };
