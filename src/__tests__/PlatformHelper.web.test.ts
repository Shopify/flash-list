import {
  getCellContainerPlatformStyles,
  getItemAnimator,
} from "../utils/PlatformHelper.web";

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
    const expectedTransform = "translate(20px,70px)";
    const expectedTransformInverted = "translate(30px,30px) scaleY(-1)";

    expect(transformStyle?.transform).toBe(expectedTransform);
    expect(transformStyle?.WebkitTransform).toBe(expectedTransform);
    expect(transformInvertedStyle?.transform).toBe(expectedTransformInverted);
    expect(transformInvertedStyle?.WebkitTransform).toBe(
      expectedTransformInverted
    );
  });
  it("can return an animator", () => {
    expect(getItemAnimator()!["animateWillMount"]).toBeDefined();
  });
});
