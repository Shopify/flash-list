"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContentContainerPadding = exports.applyContentContainerInsetForLayoutManager = exports.hasUnsupportedKeysInContentContainerStyle = exports.updateContentStyle = void 0;
var tslib_1 = require("tslib");
var updateContentStyle = function (contentStyle, contentContainerStyleSource) {
    var _a = (contentContainerStyleSource !== null && contentContainerStyleSource !== void 0 ? contentContainerStyleSource : {}), paddingTop = _a.paddingTop, paddingRight = _a.paddingRight, paddingBottom = _a.paddingBottom, paddingLeft = _a.paddingLeft, padding = _a.padding, paddingVertical = _a.paddingVertical, paddingHorizontal = _a.paddingHorizontal, backgroundColor = _a.backgroundColor, flexGrow = _a.flexGrow;
    contentStyle.paddingLeft = Number(paddingLeft || paddingHorizontal || padding || 0);
    contentStyle.paddingRight = Number(paddingRight || paddingHorizontal || padding || 0);
    contentStyle.paddingTop = Number(paddingTop || paddingVertical || padding || 0);
    contentStyle.paddingBottom = Number(paddingBottom || paddingVertical || padding || 0);
    contentStyle.backgroundColor = backgroundColor;
    contentStyle.flexGrow = flexGrow;
    return contentStyle;
};
exports.updateContentStyle = updateContentStyle;
var hasUnsupportedKeysInContentContainerStyle = function (contentContainerStyleSource) {
    var _a = (contentContainerStyleSource !== null && contentContainerStyleSource !== void 0 ? contentContainerStyleSource : {}), paddingTop = _a.paddingTop, paddingRight = _a.paddingRight, paddingBottom = _a.paddingBottom, paddingLeft = _a.paddingLeft, padding = _a.padding, paddingVertical = _a.paddingVertical, paddingHorizontal = _a.paddingHorizontal, backgroundColor = _a.backgroundColor, rest = tslib_1.__rest(_a, ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "padding", "paddingVertical", "paddingHorizontal", "backgroundColor"]);
    return Object.keys(rest).length > 0;
};
exports.hasUnsupportedKeysInContentContainerStyle = hasUnsupportedKeysInContentContainerStyle;
/** Applies padding corrections to given dimension. Mutates the dim object that was passed and returns it. */
var applyContentContainerInsetForLayoutManager = function (dim, contentContainerStyle, horizontal) {
    var contentStyle = (0, exports.updateContentStyle)({}, contentContainerStyle);
    if (horizontal) {
        dim.height -= contentStyle.paddingTop + contentStyle.paddingBottom;
    }
    else {
        dim.width -= contentStyle.paddingLeft + contentStyle.paddingRight;
    }
    return dim;
};
exports.applyContentContainerInsetForLayoutManager = applyContentContainerInsetForLayoutManager;
/** Returns padding to be applied on content container and will ignore paddings that have already been handled. */
var getContentContainerPadding = function (contentStyle, horizontal) {
    if (horizontal) {
        return {
            paddingTop: contentStyle.paddingTop,
            paddingBottom: contentStyle.paddingBottom,
        };
    }
    else {
        return {
            paddingLeft: contentStyle.paddingLeft,
            paddingRight: contentStyle.paddingRight,
        };
    }
};
exports.getContentContainerPadding = getContentContainerPadding;
//# sourceMappingURL=ContentContainerUtils.js.map