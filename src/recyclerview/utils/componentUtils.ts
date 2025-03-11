import React from "react";

/**
 * Helper function to handle both React components and React elements
 * @param component The component to validate and render
 * @returns The rendered component or null
 */
export const getValidComponent = (
  component: React.ComponentType<any> | React.ReactElement | null | undefined
): React.ReactElement | null => {
  if (React.isValidElement(component)) {
    return component;
  } else if (typeof component === "function") {
    return React.createElement(component);
  }
  return null;
};
