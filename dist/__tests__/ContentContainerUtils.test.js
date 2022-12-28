"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ContentContainerUtils_1 = require("../utils/ContentContainerUtils");
describe("ContentContainerUtils", function () {
    it("detects unsupported keys in style", function () {
        expect((0, ContentContainerUtils_1.hasUnsupportedKeysInContentContainerStyle)({ flex: 1 })).toBe(true);
        expect((0, ContentContainerUtils_1.hasUnsupportedKeysInContentContainerStyle)({ paddingTop: 0 })).toBe(false);
        expect((0, ContentContainerUtils_1.hasUnsupportedKeysInContentContainerStyle)({
            paddingTop: 1,
            paddingVertical: 1,
        })).toBe(false);
        expect((0, ContentContainerUtils_1.hasUnsupportedKeysInContentContainerStyle)({
            paddingTop: 1,
            paddingVertical: 1,
            padding: 1,
            paddingLeft: 1,
            paddingRight: 1,
            paddingBottom: 1,
            backgroundColor: "red",
            paddingHorizontal: 1,
        })).toBe(false);
        expect((0, ContentContainerUtils_1.hasUnsupportedKeysInContentContainerStyle)({ margin: 1 })).toBe(true);
        expect((0, ContentContainerUtils_1.hasUnsupportedKeysInContentContainerStyle)({ padding: 1 })).toBe(false);
        expect((0, ContentContainerUtils_1.hasUnsupportedKeysInContentContainerStyle)({ backgroundColor: "red" })).toBe(false);
    });
    it("updated content style to have all supported styles defined", function () {
        expect((0, ContentContainerUtils_1.updateContentStyle)({}, { padding: 1, backgroundColor: "red" })).toEqual({
            paddingTop: 1,
            paddingBottom: 1,
            paddingLeft: 1,
            paddingRight: 1,
            backgroundColor: "red",
        });
        expect((0, ContentContainerUtils_1.updateContentStyle)({}, { paddingHorizontal: 1 })).toEqual({
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: 1,
            paddingRight: 1,
        });
        expect((0, ContentContainerUtils_1.updateContentStyle)({}, { paddingVertical: 1 })).toEqual({
            paddingTop: 1,
            paddingBottom: 1,
            paddingLeft: 0,
            paddingRight: 0,
        });
        expect((0, ContentContainerUtils_1.updateContentStyle)({}, { paddingLeft: "1", paddingVertical: "1" })).toEqual({
            paddingTop: 1,
            paddingBottom: 1,
            paddingLeft: 1,
            paddingRight: 0,
        });
    });
    it("computes correct layout manager insets", function () {
        expect((0, ContentContainerUtils_1.applyContentContainerInsetForLayoutManager)({ height: 0, width: 0 }, { padding: 1 }, false)).toEqual({ height: 0, width: -2 });
        expect((0, ContentContainerUtils_1.applyContentContainerInsetForLayoutManager)({ height: 0, width: 0 }, { padding: 1 }, true)).toEqual({ height: -2, width: 0 });
        expect((0, ContentContainerUtils_1.applyContentContainerInsetForLayoutManager)({ height: 0, width: 0 }, { paddingVertical: 1 }, true)).toEqual({ height: -2, width: 0 });
    });
    it("calculated correct padding for scrollview content", function () {
        expect((0, ContentContainerUtils_1.getContentContainerPadding)({
            paddingLeft: 1,
            paddingTop: 1,
            paddingBottom: 1,
            paddingRight: 1,
            backgroundColor: "red",
        }, true)).toEqual({
            paddingTop: 1,
            paddingBottom: 1,
            paddingLeft: undefined,
            paddingRight: undefined,
        });
        expect((0, ContentContainerUtils_1.getContentContainerPadding)({
            paddingLeft: 1,
            paddingTop: 1,
            paddingBottom: 1,
            paddingRight: 1,
            backgroundColor: "red",
        }, false)).toEqual({
            paddingTop: undefined,
            paddingBottom: undefined,
            paddingLeft: 1,
            paddingRight: 1,
        });
    });
});
//# sourceMappingURL=ContentContainerUtils.test.js.map