import { HostComponent, View } from "react-native";

import type { AutoLayoutViewNativeComponentProps } from "./AutoLayoutViewNativeComponentProps";

const AutoLayoutViewNativeComponent =
  View as any as HostComponent<AutoLayoutViewNativeComponentProps>;
export default AutoLayoutViewNativeComponent;
