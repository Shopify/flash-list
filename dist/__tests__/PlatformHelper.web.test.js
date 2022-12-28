"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PlatformHelper_web_1 = require("../native/config/PlatformHelper.web");
describe("Platform Helper Web", function () {
    it("can compute right transform for web", function () {
        var transformStyle = (0, PlatformHelper_web_1.getCellContainerPlatformStyles)(false, {
            x: 20,
            y: 70,
        });
        var transformInvertedStyle = (0, PlatformHelper_web_1.getCellContainerPlatformStyles)(true, {
            x: 30,
            y: 30,
        });
        var transformHorizontalInvertedStyle = (0, PlatformHelper_web_1.getCellContainerPlatformStyles)(true, {
            x: 30,
            y: 30,
            isHorizontal: true,
        });
        var expectedTransform = "translate(20px,70px)";
        var expectedTransformInverted = "translate(30px,30px) scaleY(-1)";
        var expectedTransformHorizontalInverted = "translate(30px,30px) scaleX(-1)";
        expect(transformStyle === null || transformStyle === void 0 ? void 0 : transformStyle.transform).toBe(expectedTransform);
        expect(transformStyle === null || transformStyle === void 0 ? void 0 : transformStyle.WebkitTransform).toBe(expectedTransform);
        expect(transformInvertedStyle === null || transformInvertedStyle === void 0 ? void 0 : transformInvertedStyle.transform).toBe(expectedTransformInverted);
        expect(transformInvertedStyle === null || transformInvertedStyle === void 0 ? void 0 : transformInvertedStyle.WebkitTransform).toBe(expectedTransformInverted);
        expect(transformHorizontalInvertedStyle === null || transformHorizontalInvertedStyle === void 0 ? void 0 : transformHorizontalInvertedStyle.transform).toBe(expectedTransformHorizontalInverted);
        expect(transformHorizontalInvertedStyle === null || transformHorizontalInvertedStyle === void 0 ? void 0 : transformHorizontalInvertedStyle.WebkitTransform).toBe(expectedTransformHorizontalInverted);
    });
    it("can return an animator", function () {
        expect((0, PlatformHelper_web_1.getItemAnimator)()["animateWillMount"]).toBeDefined();
    });
});
//# sourceMappingURL=PlatformHelper.web.test.js.map