import codegenNativeComponent from "react-native/Libraries/Utilities/codegenNativeComponent";
import type { ViewProps, HostComponent } from "react-native";
import type {
  Int32,
  Double,
  DirectEventHandler,
} from "react-native/Libraries/Types/CodegenTypes";

export type BlankAreaEvent = Readonly<{
  offsetStart: Int32;
  offsetEnd: Int32;
}>;

export type onBlankAreaEvent = DirectEventHandler<BlankAreaEvent>;

interface NativeProps extends ViewProps {
  horizontal?: boolean;
  scrollOffset?: Double;
  windowSize?: Double;
  renderAheadOffset?: Double;
  enableInstrumentation?: boolean;
  disableAutoLayout?: boolean;
  onBlankAreaEvent?: DirectEventHandler<BlankAreaEvent>;
}

export default codegenNativeComponent<NativeProps>(
  "AutoLayoutView"
) as HostComponent<NativeProps>;
