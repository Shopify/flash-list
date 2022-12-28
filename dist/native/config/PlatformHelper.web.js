"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFooterContainer = exports.getItemAnimator = exports.getCellContainerPlatformStyles = exports.PlatformConfig = void 0;
var react_native_1 = require("react-native");
var DefaultJSItemAnimator_1 = require("recyclerlistview/dist/reactnative/platform/reactnative/itemanimators/defaultjsanimator/DefaultJSItemAnimator");
var PlatformConfig = {
    defaultDrawDistance: 2000,
};
exports.PlatformConfig = PlatformConfig;
var getCellContainerPlatformStyles = function (inverted, parentProps) {
    var transformValue = "translate(".concat(parentProps.x, "px,").concat(parentProps.y, "px)").concat(inverted ? " ".concat(parentProps.isHorizontal ? "scaleX" : "scaleY", "(-1)") : "");
    return { transform: transformValue, WebkitTransform: transformValue };
};
exports.getCellContainerPlatformStyles = getCellContainerPlatformStyles;
var getItemAnimator = function () {
    return new DefaultJSItemAnimator_1.DefaultJSItemAnimator();
};
exports.getItemAnimator = getItemAnimator;
var getFooterContainer = function () {
    return react_native_1.View;
};
exports.getFooterContainer = getFooterContainer;
//# sourceMappingURL=PlatformHelper.web.js.map