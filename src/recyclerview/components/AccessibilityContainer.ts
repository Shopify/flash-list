import type { ComponentType } from "react";
import { View, ViewProps } from "react-native";

export interface AccessibilityContainerProps extends ViewProps {
  reverseAccessibilityOrder?: boolean;
}

export const AccessibilityContainer =
  View as ComponentType<AccessibilityContainerProps>;
