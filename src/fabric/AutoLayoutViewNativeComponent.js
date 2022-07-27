/**
 * @flow strict-local
 * @format
 */
/* eslint-disable */
import codegenNativeComponent from "react-native/Libraries/Utilities/codegenNativeComponent";
import type { HostComponent } from "react-native";
import type { ColorValue } from "react-native/Libraries/StyleSheet/StyleSheet";
import type { ViewProps } from "react-native/Libraries/Components/View/ViewPropTypes";
import type {
  Int32,
  DirectEventHandler,
} from "react-native/Libraries/Types/CodegenTypes";

type BlankAreaEvent = $ReadOnly<{|
  offsetStart: Int32,
  offsetEnd: Int32,
|}>;

type NativeProps = $ReadOnly<{|
  ...ViewProps, // This is required.
  horizontal?: boolean,
  scrollOffset?: Double,
  windowSize?: Double,
  renderAheadOffset?: Double,
  enableInstrumentation?: boolean,
  onBlankAreaEvent?: DirectEventHandler<BlankAreaEvent>, // This type is not parsable by the TS codegen, once it is, let's rewrite this file to TS
|}>;

type ComponentType = HostComponent<NativeProps>;

export default (codegenNativeComponent<NativeProps>(
  "AutoLayoutView",
  {}
): ComponentType);
