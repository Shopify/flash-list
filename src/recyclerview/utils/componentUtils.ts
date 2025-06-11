import React from "react";

/**
 * Helper function to handle both React components and React elements.
 * This utility ensures proper rendering of components whether they are passed as
 * component types or pre-rendered elements.
 *
 * @param component - Can be a React component type, React element, null, or undefined
 * @returns A valid React element if the input is valid, null otherwise
 *
 * @example
 * // With a component type
 * getValidComponent(MyComponent)
 *
 * @example
 * // With a pre-rendered element
 * getValidComponent(<MyComponent />)
 */
export const getValidComponent = (
  component: React.ComponentType | React.ReactElement | null | undefined
): React.ReactElement | null => {
  if (React.isValidElement(component)) {
    return component;
  } else if (typeof component === "function") {
    return React.createElement(component);
  }
  return null;
};
