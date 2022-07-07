import { requireNativeComponent } from "react-native";

/**
 * Behaves as a regular `View` with an extra `index` prop that is saved in the native layer.
 */
const CellContainer = requireNativeComponent("CellContainer");
export default CellContainer;
