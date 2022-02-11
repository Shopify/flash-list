import { requireNativeComponent } from "react-native";

interface OnInteractiveEvent {
  nativeEvent: {
    timestamp: number;
  };
}

interface OnBlankAreaEvent {
  nativeEvent: {
    offsetStart: number;
    offsetEnd: number;
  };
}

type OnInteractiveHandler = (event: OnInteractiveEvent) => void;
type OnBlankAreaEventHandler = (event: OnBlankAreaEvent) => void;

interface FlatListPerformanceViewNativeComponentProps {
  onInteractive: OnInteractiveHandler;
  onBlankAreaEvent: OnBlankAreaEventHandler;
}

const FlatListPerformanceViewNativeComponent =
  requireNativeComponent<FlatListPerformanceViewNativeComponentProps>(
    "FlatListPerformanceView"
  );
export { FlatListPerformanceViewNativeComponent };
