import { measureFirstChildLayout } from "../recyclerview/utils/measureLayout.web";

describe("measureFirstChildLayout on web", () => {
  it.each([0.6, 0.8, 1])(
    "returns layout dimensions inside a container scaled to %s",
    (scale) => {
      const parent = {
        getBoundingClientRect: () => ({ left: 100, top: 50 }),
      } as unknown as Element;
      const child = {
        clientWidth: 900,
        clientHeight: 400,
        parentElement: parent,
        getBoundingClientRect: () => ({
          left: 100,
          top: 50,
          width: 900 * scale,
          height: 400 * scale,
        }),
      } as unknown as Element;

      expect(measureFirstChildLayout(child, parent)).toEqual({
        x: 0,
        y: 0,
        width: 900,
        height: 400,
      });
    }
  );

  it("reads updated layout dimensions after a resize", () => {
    const parent = {
      getBoundingClientRect: () => ({ left: 0, top: 0 }),
    } as unknown as Element;
    const child = {
      clientWidth: 900,
      clientHeight: 400,
      parentElement: parent,
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        width: 720,
        height: 320,
      }),
    };

    expect(
      measureFirstChildLayout(child as unknown as Element, parent)
    ).toMatchObject({
      width: 900,
      height: 400,
    });

    child.clientWidth = 640;
    child.clientHeight = 300;

    expect(
      measureFirstChildLayout(child as unknown as Element, parent)
    ).toMatchObject({
      width: 640,
      height: 300,
    });
  });
});
