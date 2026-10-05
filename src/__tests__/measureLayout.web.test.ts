import { isViewHidden } from "../recyclerview/utils/measureLayout.web";

const createElement = (clientWidth: number, clientHeight: number) =>
  ({ clientWidth, clientHeight } as unknown as Element);

describe("measureLayout.web isViewHidden", () => {
  it("treats a missing element as hidden", () => {
    expect(isViewHidden(null)).toBe(true);
  });

  it("treats a zero-sized element (display: none) as hidden", () => {
    expect(isViewHidden(createElement(0, 0))).toBe(true);
  });

  it("does not treat a visible element as hidden", () => {
    expect(isViewHidden(createElement(400, 800))).toBe(false);
  });

  it("does not treat an element with only one zero dimension as hidden", () => {
    // e.g. a horizontal list before its height is known
    expect(isViewHidden(createElement(400, 0))).toBe(false);
    expect(isViewHidden(createElement(0, 800))).toBe(false);
  });
});
