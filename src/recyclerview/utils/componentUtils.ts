import React from "react";

type RenderableComponent =
  | React.ComponentType
  | React.ExoticComponent
  | React.ReactElement
  | null
  | undefined;

/**
 * Returns true if the value is a React class component.
 * Class components set `prototype.isReactComponent` per React convention,
 * which distinguishes them from plain functions and render props.
 */
export const isComponentClass = (value: unknown): boolean =>
  typeof value === "function" &&
  Boolean(
    (value as { prototype?: { isReactComponent?: unknown } }).prototype
      ?.isReactComponent
  );

/**
 * Helper function to handle both React components and React elements.
 * This utility ensures proper rendering of components whether they are passed as
 * component types or pre-rendered elements. Supports function components, class
 * components, React.memo, React.forwardRef, and pre-rendered elements.
 *
 * @param component - Can be a React component type, exotic component, React element, null, or undefined
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
  component: RenderableComponent
): React.ReactElement | null => {
  if (React.isValidElement(component)) {
    return component;
  } else if (component != null) {
    // Cast needed: React.createElement's type overloads don't include ExoticComponent,
    // but it handles memo/forwardRef/lazy correctly at runtime.
    return React.createElement(component as React.ComponentType);
  }
  return null;
};
