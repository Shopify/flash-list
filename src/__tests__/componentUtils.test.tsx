import React from "react";

import {
  getValidComponent,
  isComponentClass,
} from "../recyclerview/utils/componentUtils";

const SimpleComponent = () => React.createElement("View");
const MemoizedComponent = React.memo(SimpleComponent);
const ForwardRefComponent = React.forwardRef(function ForwardRefComp(
  _props,
  _ref
) {
  return React.createElement("View");
});

describe("getValidComponent", () => {
  it("returns null for null", () => {
    expect(getValidComponent(null)).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(getValidComponent(undefined)).toBeNull();
  });

  it("renders a function component", () => {
    const result = getValidComponent(SimpleComponent);
    expect(result).not.toBeNull();
    expect(React.isValidElement(result)).toBe(true);
  });

  it("renders a React.memo component", () => {
    const result = getValidComponent(MemoizedComponent);
    expect(result).not.toBeNull();
    expect(React.isValidElement(result)).toBe(true);
  });

  it("renders a React.forwardRef component", () => {
    const result = getValidComponent(ForwardRefComponent);
    expect(result).not.toBeNull();
    expect(React.isValidElement(result)).toBe(true);
  });

  it("passes through a pre-rendered element", () => {
    const element = React.createElement(SimpleComponent);
    const result = getValidComponent(element);
    expect(result).toBe(element);
  });
});

describe("isComponentClass", () => {
  it("returns true for a class component", () => {
    // eslint-disable-next-line react/prefer-stateless-function
    class MyClass extends React.Component {
      render() {
        return null;
      }
    }
    expect(isComponentClass(MyClass)).toBe(true);
  });

  it("returns false for a function component", () => {
    expect(isComponentClass(SimpleComponent)).toBe(false);
  });

  it("returns false for React.memo", () => {
    expect(isComponentClass(MemoizedComponent)).toBe(false);
  });

  it("returns false for React.forwardRef", () => {
    expect(isComponentClass(ForwardRefComponent)).toBe(false);
  });

  it("returns false for null and undefined", () => {
    expect(isComponentClass(null)).toBe(false);
    expect(isComponentClass(undefined)).toBe(false);
  });

  it("returns false for a plain function", () => {
    const renderFn = () => React.createElement("View");
    expect(isComponentClass(renderFn)).toBe(false);
  });
});
