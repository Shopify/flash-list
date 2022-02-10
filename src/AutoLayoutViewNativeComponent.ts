import { requireNativeComponent } from "react-native";

export interface OnBlankAreaEvent {
  nativeEvent: {
    offsetStart: number;
    offsetEnd: number;
  };
}

type OnBlankAreaEventHandler = (event: OnBlankAreaEvent) => void;

interface AutoLayoutViewNativeComponentProps {
  onBlankAreaEvent: OnBlankAreaEventHandler;
  enableInstrumentation: boolean;
}

const AutoLayoutViewNativeComponent =
  requireNativeComponent<AutoLayoutViewNativeComponentProps>("AutoLayoutView");
export default AutoLayoutViewNativeComponent;
