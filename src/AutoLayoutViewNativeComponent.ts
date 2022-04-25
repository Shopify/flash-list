/* eslint-disable @typescript-eslint/no-var-requires */
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

const AutoLayoutViewNativeComponent = (global as any)?.nativeFabricUIManager
  ? require("fabric/AutoLayoutViewNativeComponent").default
  : requireNativeComponent<AutoLayoutViewNativeComponentProps>(
      "AutoLayoutView"
    );

export default AutoLayoutViewNativeComponent;
