"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var react_native_1 = require("react-native");
var recyclerlistview_1 = require("recyclerlistview");
var mountFlashList_1 = require("./helpers/mountFlashList");
describe("GridLayoutProviderWithProps", function () {
    it("updates average window on layout manager change", function () {
        var _a;
        var flashList = (0, mountFlashList_1.mountFlashList)();
        var oldAverageWindow = flashList.instance.state
            .layoutProvider["averageWindow"];
        // width change from default 400 to 600 will force layout manager to change
        (_a = flashList.find(react_native_1.ScrollView)) === null || _a === void 0 ? void 0 : _a.trigger("onLayout", {
            nativeEvent: { layout: { height: 900, width: 600 } },
        });
        var newAverageWindow = flashList.instance.state.layoutProvider["averageWindow"];
        expect(newAverageWindow).not.toBe(oldAverageWindow);
        flashList.unmount();
    });
    it("average window's size is two times the number of items that will fill the screen", function () {
        var _a;
        var flashList = (0, mountFlashList_1.mountFlashList)({ numColumns: 2 });
        expect(flashList.instance.state.layoutProvider["averageWindow"]["inputValues"]
            .length).toBe(20);
        (_a = flashList.find(react_native_1.ScrollView)) === null || _a === void 0 ? void 0 : _a.trigger("onLayout", {
            nativeEvent: { layout: { height: 2000, width: 600 } },
        });
        expect(flashList.instance.state.layoutProvider["averageWindow"]["inputValues"]
            .length).toBe(40);
        flashList.setProps({ numColumns: 1 });
        expect(flashList.instance.state.layoutProvider["averageWindow"]["inputValues"]
            .length).toBe(20);
        flashList.unmount();
    });
    it("average window should not be less than 6 in size", function () {
        var _a;
        var flashList = (0, mountFlashList_1.mountFlashList)();
        (_a = flashList.find(react_native_1.ScrollView)) === null || _a === void 0 ? void 0 : _a.trigger("onLayout", {
            nativeEvent: { layout: { height: 100, width: 100 } },
        });
        expect(flashList.instance.state.layoutProvider["averageWindow"]["inputValues"]
            .length).toBe(6);
        flashList.unmount();
    });
    it("vertical list: average should not update when widths change", function () {
        var _a;
        var flashList = (0, mountFlashList_1.mountFlashList)();
        var layoutProvider = flashList.instance.state.layoutProvider;
        var oldAverage = layoutProvider.averageItemSize;
        layoutProvider.getLayoutManager().getLayouts()[0].width = 500;
        (_a = flashList.find(recyclerlistview_1.ProgressiveListView)) === null || _a === void 0 ? void 0 : _a.instance.onItemLayout(0);
        expect(oldAverage).toBe(layoutProvider.averageItemSize);
        flashList.unmount();
    });
    it("horizontal list: average should not update when heights change", function () {
        var _a;
        var flashList = (0, mountFlashList_1.mountFlashList)({ horizontal: true });
        var layoutProvider = flashList.instance.state.layoutProvider;
        var oldAverage = layoutProvider.averageItemSize;
        layoutProvider.getLayoutManager().getLayouts()[0].height = 600;
        // Can throw a no op set state warning. Should be handled in PLV.
        (_a = flashList.find(recyclerlistview_1.ProgressiveListView)) === null || _a === void 0 ? void 0 : _a.instance.onItemLayout(0);
        expect(oldAverage).toBe(layoutProvider.averageItemSize);
        flashList.unmount();
    });
    it("computes correct average", function () {
        var flashList = (0, mountFlashList_1.mountFlashList)();
        var layoutProvider = flashList.instance.state.layoutProvider;
        expect(layoutProvider.averageItemSize).toBe(200);
        var layouts = layoutProvider.getLayoutManager().getLayouts();
        var progressiveListView = flashList.find(recyclerlistview_1.ProgressiveListView);
        layouts[0].height = 100;
        layouts[1].height = 200;
        layouts[2].height = 300;
        layouts[3].height = 400;
        progressiveListView === null || progressiveListView === void 0 ? void 0 : progressiveListView.instance.onItemLayout(0);
        progressiveListView === null || progressiveListView === void 0 ? void 0 : progressiveListView.instance.onItemLayout(1);
        progressiveListView === null || progressiveListView === void 0 ? void 0 : progressiveListView.instance.onItemLayout(2);
        progressiveListView === null || progressiveListView === void 0 ? void 0 : progressiveListView.instance.onItemLayout(3);
        // estimatedItemSize is treated as one of the values. That's why 240.
        expect(layoutProvider.averageItemSize).toBe(240);
        flashList.unmount();
    });
    it("updates all cached widths for vertical list and heights for horizontal list when orientation changes", function () {
        var runCacheUpdateTest = function (horizontal) {
            var _a;
            var flashList = (0, mountFlashList_1.mountFlashList)({
                data: new Array(20).fill("1"),
                horizontal: horizontal,
            });
            var progressiveListView = flashList.find(recyclerlistview_1.ProgressiveListView);
            var layoutProvider = flashList.instance.state.layoutProvider;
            layoutProvider
                .getLayoutManager()
                .getLayouts()
                .forEach(function (layout, index) {
                // marking layouts as if they're actual rendered sizes
                progressiveListView === null || progressiveListView === void 0 ? void 0 : progressiveListView.instance.onItemLayout(index);
                // checking size
                if (horizontal) {
                    expect(layout.height).toBe(900);
                }
                else {
                    expect(layout.width).toBe(400);
                }
            });
            // simulates orientation change
            (_a = flashList.find(react_native_1.ScrollView)) === null || _a === void 0 ? void 0 : _a.trigger("onLayout", {
                nativeEvent: { layout: { height: 400, width: 900 } },
            });
            layoutProvider
                .getLayoutManager()
                .getLayouts()
                .forEach(function (layout) {
                // making sure all widths or heights are updated
                if (horizontal) {
                    expect(layout.height).toBe(400);
                }
                else {
                    expect(layout.width).toBe(900);
                }
                // making sure extra keys don't make their way to layout unnecessarily
                expect(Object.keys(layout).length).toBe(6);
            });
            flashList.unmount();
        };
        // vertical list
        runCacheUpdateTest(false);
        // horizontal list
        runCacheUpdateTest(true);
    });
    it("expires if column count or padding changes", function () {
        var flashList = (0, mountFlashList_1.mountFlashList)();
        var baseProps = flashList.instance.props;
        expect(flashList.instance.state.layoutProvider.updateProps(tslib_1.__assign(tslib_1.__assign({}, baseProps), { contentContainerStyle: { paddingTop: 10 } })).hasExpired).toBe(false);
        expect(flashList.instance.state.layoutProvider.updateProps(tslib_1.__assign(tslib_1.__assign({}, baseProps), { contentContainerStyle: { paddingBottom: 10 } })).hasExpired).toBe(false);
        expect(flashList.instance.state.layoutProvider.updateProps(tslib_1.__assign(tslib_1.__assign({}, baseProps), { contentContainerStyle: { paddingLeft: 10 } })).hasExpired).toBe(true);
        flashList.instance.state.layoutProvider["_hasExpired"] = false;
        expect(flashList.instance.state.layoutProvider.updateProps(tslib_1.__assign(tslib_1.__assign({}, baseProps), { numColumns: 2 })).hasExpired).toBe(true);
    });
});
//# sourceMappingURL=GridLayoutProviderWithProps.test.js.map