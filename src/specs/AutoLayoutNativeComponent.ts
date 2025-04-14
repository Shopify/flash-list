import codegenNativeComponent from "react-native/Libraries/Utilities/codegenNativeComponent";
import type { ViewProps } from "react-native";
import type {
  Int32,
  Double,
  DirectEventHandler,
} from "react-native/Libraries/Types/CodegenTypes";

type BlankAreaEvent = Readonly<{
  offsetStart: Int32;
  offsetEnd: Int32;
}>;

interface NativeProps extends ViewProps {
  horizontal?: boolean;
  scrollOffset?: Double;
  windowSize?: Double;
  renderAheadOffset?: Double;
  enableInstrumentation?: boolean;
  disableAutoLayout?: boolean;
  onBlankAreaEvent?: DirectEventHandler<BlankAreaEvent>;
}

export default codegenNativeComponent<NativeProps>("AutoLayoutView");
