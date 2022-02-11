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

interface RecyclerFlatListPerformanceViewNativeComponentProps {
  onInteractive: OnInteractiveHandler;
  onBlankAreaEvent: OnBlankAreaEventHandler;
}

const RecyclerFlatListPerformanceViewNativeComponent =
  requireNativeComponent<RecyclerFlatListPerformanceViewNativeComponentProps>(
    "RecyclerFlatListPerformanceView"
  );
export { RecyclerFlatListPerformanceViewNativeComponent };
