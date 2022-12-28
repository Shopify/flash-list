"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFooterContainer = exports.getItemAnimator = exports.getCellContainerPlatformStyles = exports.PlatformConfig = void 0;
var DefaultJSItemAnimator_1 = require("recyclerlistview/dist/reactnative/platform/reactnative/itemanimators/defaultjsanimator/DefaultJSItemAnimator");
var PlatformConfig = {
    defaultDrawDistance: 250,
};
exports.PlatformConfig = PlatformConfig;
var getCellContainerPlatformStyles = function (inverted, parentProps) {
    return undefined;
};
exports.getCellContainerPlatformStyles = getCellContainerPlatformStyles;
var getItemAnimator = function () {
    return new DefaultJSItemAnimator_1.DefaultJSItemAnimator();
};
exports.getItemAnimator = getItemAnimator;
var getFooterContainer = function () {
    return undefined;
};
exports.getFooterContainer = getFooterContainer;
//# sourceMappingURL=PlatformHelper.js.map