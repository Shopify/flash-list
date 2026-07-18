import type { ComponentType } from "react";
import {
  requireNativeComponent,
  UIManager,
  View,
  ViewProps,
} from "react-native";

export interface AccessibilityContainerProps extends ViewProps {
  reverseAccessibilityOrder?: boolean;
}

const componentName = "FlashListAccessibilityView";

export const AccessibilityContainer = UIManager.hasViewManagerConfig(
  componentName
)
  ? requireNativeComponent<AccessibilityContainerProps>(componentName)
  : (View as ComponentType<AccessibilityContainerProps>);
