import {
  getCellContainerPlatformStyles,
  getItemAnimator,
} from "../native/config/PlatformHelper.web";

describe("Platform Helper Web", () => {
  it("can compute right transform for web", () => {
    const transformStyle = getCellContainerPlatformStyles(false, {
      x: 20,
      y: 70,
    });
    const transformInvertedStyle = getCellContainerPlatformStyles(true, {
      x: 30,
      y: 30,
    });
    const transformHorizontalInvertedStyle = getCellContainerPlatformStyles(
      true,
      {
        x: 30,
        y: 30,
        isHorizontal: true,
      }
    );
    const expectedTransform = "translate(20px,70px)";
    const expectedTransformInverted = "translate(30px,30px) scaleY(-1)";
    const expectedTransformHorizontalInverted =
      "translate(30px,30px) scaleX(-1)";

    expect(transformStyle?.transform).toBe(expectedTransform);
    expect(transformStyle?.WebkitTransform).toBe(expectedTransform);
    expect(transformInvertedStyle?.transform).toBe(expectedTransformInverted);
    expect(transformInvertedStyle?.WebkitTransform).toBe(
      expectedTransformInverted
    );
    expect(transformHorizontalInvertedStyle?.transform).toBe(
      expectedTransformHorizontalInverted
    );
    expect(transformHorizontalInvertedStyle?.WebkitTransform).toBe(
      expectedTransformHorizontalInverted
    );
  });
  it("can return an animator", () => {
    expect(getItemAnimator()!["animateWillMount"]).toBeDefined();
  });
});
