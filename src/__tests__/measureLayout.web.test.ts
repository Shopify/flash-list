import { measureFirstChildLayout } from "../recyclerview/utils/measureLayout.web";

const rect = (
  left: number,
  top: number,
  width: number,
  height: number
): DOMRect =>
  ({
    bottom: top + height,
    height,
    left,
    right: left + width,
    top,
    width,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect);

describe("measureFirstChildLayout on web", () => {
  it("uses transform-independent layout offsets for an inverted child", () => {
    let scrollTop = 0;
    const parent = {
      getBoundingClientRect: () => rect(0, 0, 420, 743),
      offsetParent: null,
    } as unknown as HTMLElement;
    const child = {
      getBoundingClientRect: () => rect(0, 735 + scrollTop, 420, 1),
      offsetLeft: 0,
      offsetParent: parent,
      offsetTop: 8,
      parentElement: parent,
      scrollLeft: 0,
      get scrollTop() {
        return scrollTop;
      },
    } as unknown as HTMLElement;

    expect(measureFirstChildLayout(child, parent)).toEqual({
      x: 0,
      y: 8,
      width: 420,
      height: 1,
    });

    scrollTop = 1200;

    expect(measureFirstChildLayout(child, parent)).toEqual({
      x: 0,
      y: 8,
      width: 420,
      height: 1,
    });
  });

  it("falls back to rect and scroll offsets outside the offset-parent chain", () => {
    const parent = {
      getBoundingClientRect: () => rect(10, 20, 400, 700),
    } as unknown as HTMLElement;
    const child = {
      getBoundingClientRect: () => rect(17, 35, 120, 80),
      offsetLeft: 7,
      offsetParent: null,
      offsetTop: 15,
      parentElement: parent,
      scrollLeft: 2,
      scrollTop: 3,
    } as unknown as HTMLElement;

    expect(measureFirstChildLayout(child, parent)).toEqual({
      x: 9,
      y: 18,
      width: 120,
      height: 80,
    });
  });
});
