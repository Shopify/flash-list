import { requireNativeComponent } from "react-native";

import { AutoLayoutViewNativeComponentProps } from "./AutoLayoutViewNativeComponentProps";

const AutoLayoutViewNativeComponent =
  requireNativeComponent<AutoLayoutViewNativeComponentProps>("AutoLayoutView");
export default AutoLayoutViewNativeComponent;
