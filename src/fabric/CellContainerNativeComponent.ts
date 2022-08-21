// @ts-ignore TODO: remove once there is a .d.ts file with definitions
import codegenNativeComponentUntyped from "react-native/Libraries/Utilities/codegenNativeComponent";
// @ts-ignore TODO: remove once there is a .d.ts file with definitions
import type {
  Int32,
  // @ts-ignore TODO: remove once there is a .d.ts file with definitions
} from "react-native/Libraries/Types/CodegenTypes";
import type { ViewProps, HostComponent } from "react-native";

// eslint-disable-next-line @typescript-eslint/ban-types
const codegenNativeComponent = codegenNativeComponentUntyped as <T extends {}>(
  name: string
) => HostComponent<T>;

interface NativeProps extends ViewProps {
  index?: Int32;
}

export default codegenNativeComponent<NativeProps>("CellContainer");
