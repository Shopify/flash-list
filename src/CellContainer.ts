/* eslint-disable @typescript-eslint/no-var-requires */
import { requireNativeComponent } from "react-native";

const CellContainer = (global as any)?.nativeFabricUIManager
  ? require("fabric/CellContainerNativeComponent").default
  : requireNativeComponent("CellContainer");

export default CellContainer;
