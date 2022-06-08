import React from "react";
import { View } from "react-native";

import { AutoLayoutViewNativeComponentProps } from "./AutoLayoutViewNativeComponentProps";

const AutoLayoutViewNativeComponent =
  View as any as React.Component<AutoLayoutViewNativeComponentProps>;
export default AutoLayoutViewNativeComponent;
