"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var react_native_1 = require("react-native");
require("@quilted/react-testing/matchers");
var recyclerlistview_1 = require("recyclerlistview");
var react_1 = tslib_1.__importDefault(require("react"));
var mountMasonryFlashList_1 = require("./helpers/mountMasonryFlashList");
describe("MasonryFlashList", function () {
    beforeEach(function () {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });
    it("renders items and has 3 internal lists", function () {
        var masonryFlashList = (0, mountMasonryFlashList_1.mountMasonryFlashList)();
        expect(masonryFlashList.findAll(recyclerlistview_1.ProgressiveListView).length).toBe(3);
        expect(masonryFlashList).toContainReactComponent(react_native_1.Text, { children: "One" });
        expect(masonryFlashList).toContainReactComponent(recyclerlistview_1.ProgressiveListView, {
            isHorizontal: false,
        });
        masonryFlashList.unmount();
    });
    it("invokes renderItem with columnIndex and columnSpan", function () {
        var mockRenderItem = jest.fn(function () { return null; });
        var masonryFlashList = (0, mountMasonryFlashList_1.mountMasonryFlashList)({
            renderItem: mockRenderItem,
            data: ["One", "Two", "Three"],
            numColumns: 3,
        });
        expect(mockRenderItem).toHaveBeenCalledWith(expect.objectContaining({
            columnIndex: 0,
            columnSpan: 1,
        }));
        expect(mockRenderItem).toHaveBeenCalledWith(expect.objectContaining({
            columnIndex: 1,
            columnSpan: 1,
        }));
        expect(mockRenderItem).toHaveBeenCalledWith(expect.objectContaining({
            columnSpan: 1,
            columnIndex: 2,
        }));
        masonryFlashList.unmount();
    });
    it("raised onLoad event only when first internal child mounts", function () {
        var _a;
        var onLoadMock = jest.fn();
        var ref = react_1.default.createRef();
        var masonryFlashList = (0, mountMasonryFlashList_1.mountMasonryFlashList)({
            onLoad: onLoadMock,
        }, ref);
        expect(onLoadMock).not.toHaveBeenCalled();
        (_a = masonryFlashList.findAll(recyclerlistview_1.ProgressiveListView)[1]) === null || _a === void 0 ? void 0 : _a.instance.onItemLayout(0);
        expect(onLoadMock).toHaveBeenCalledTimes(1);
        // on load shouldn't be passed to wrapper list
        expect(ref.current.props.onLoad).toBeUndefined();
        masonryFlashList.unmount();
    });
    it("can resize columns using getColumnFlex", function () {
        var masonryFlashList = (0, mountMasonryFlashList_1.mountMasonryFlashList)({
            getColumnFlex: function (_, column) { return (column === 0 ? 1 : 3); },
        });
        var progressiveListView = masonryFlashList.find(recyclerlistview_1.ProgressiveListView).instance;
        expect(progressiveListView.getLayout(0).width).toBe(100);
        expect(progressiveListView.getLayout(1).width).toBe(300);
        expect(masonryFlashList.findAll(recyclerlistview_1.ProgressiveListView).length).toBe(3);
        masonryFlashList.findAll(recyclerlistview_1.ProgressiveListView).forEach(function (plv, index) {
            if (index === 1) {
                expect(plv.instance.props.layoutSize.width).toBe(100);
            }
            if (index === 2) {
                expect(plv.instance.props.layoutSize.width).toBe(300);
            }
        });
        masonryFlashList.unmount();
    });
    it("mounts a single ScrollView", function () {
        var masonryFlashList = (0, mountMasonryFlashList_1.mountMasonryFlashList)();
        expect(masonryFlashList.findAll(react_native_1.ScrollView)).toHaveLength(1);
        masonryFlashList.unmount();
    });
    it("forwards single onScroll event to external listener", function () {
        var _a;
        var onScrollMock = jest.fn();
        var masonryFlashList = (0, mountMasonryFlashList_1.mountMasonryFlashList)({
            onScroll: onScrollMock,
        });
        (_a = masonryFlashList.find(react_native_1.ScrollView)) === null || _a === void 0 ? void 0 : _a.instance.props.onScroll({
            nativeEvent: { contentOffset: { x: 0, y: 0 } },
        });
        expect(onScrollMock).toHaveBeenCalledTimes(1);
        masonryFlashList.unmount();
    });
    it("updates scroll offset of all internal lists", function () {
        var _a;
        var onScrollMock = jest.fn();
        var masonryFlashList = (0, mountMasonryFlashList_1.mountMasonryFlashList)({
            onScroll: onScrollMock,
        });
        (_a = masonryFlashList.find(react_native_1.ScrollView)) === null || _a === void 0 ? void 0 : _a.instance.props.onScroll({
            nativeEvent: { contentOffset: { x: 0, y: 100 } },
        });
        masonryFlashList.findAll(recyclerlistview_1.ProgressiveListView).forEach(function (list) {
            expect(list.instance.getCurrentScrollOffset()).toBe(100);
        });
        masonryFlashList.unmount();
    });
    it("has a valid ref object", function () {
        var ref = react_1.default.createRef();
        var masonryFlashList = (0, mountMasonryFlashList_1.mountMasonryFlashList)({}, ref);
        expect(ref.current).toBeDefined();
        masonryFlashList.unmount();
    });
    it("forwards overrideItemLayout to internal lists", function () {
        var overrideItemLayout = jest.fn(function (layout) {
            layout.size = 300;
        });
        var masonryFlashList = (0, mountMasonryFlashList_1.mountMasonryFlashList)({
            overrideItemLayout: overrideItemLayout,
        });
        expect(masonryFlashList.findAll(recyclerlistview_1.ProgressiveListView).length).toBe(3);
        masonryFlashList.findAll(recyclerlistview_1.ProgressiveListView).forEach(function (list, index) {
            if (index !== 0) {
                expect(list.instance.getLayout(0).height).toBe(300);
            }
        });
        masonryFlashList.unmount();
    });
    it("forwards keyExtractor to internal list", function () {
        var keyExtractor = function (_, index) { return (index + 1).toString(); };
        var masonryFlashList = (0, mountMasonryFlashList_1.mountMasonryFlashList)({
            keyExtractor: keyExtractor,
        });
        expect(masonryFlashList.findAll(recyclerlistview_1.ProgressiveListView).length).toBe(3);
        expect(masonryFlashList
            .findAll(recyclerlistview_1.ProgressiveListView)[0]
            .instance.props.dataProvider.getStableId(0)).toBe("0");
        expect(masonryFlashList
            .findAll(recyclerlistview_1.ProgressiveListView)[1]
            .instance.props.dataProvider.getStableId(0)).toBe("1");
        expect(masonryFlashList
            .findAll(recyclerlistview_1.ProgressiveListView)[2]
            .instance.props.dataProvider.getStableId(0)).toBe("2");
        masonryFlashList.unmount();
    });
    it("correctly maps list indices to actual indices", function () {
        var data = new Array(20).fill(0).map(function (_, index) { return index.toString(); });
        var getItemType = function (item, index) {
            expect(index.toString()).toBe(item);
            return 0;
        };
        var renderItem = function (_a) {
            var item = _a.item, index = _a.index;
            expect(index.toString()).toBe(item);
            return null;
        };
        var overrideItemLayout = function (layout, item, index) {
            expect(index.toString()).toBe(item);
        };
        var keyExtractor = function (item, index) {
            expect(index.toString()).toBe(item);
            return index.toString();
        };
        var onViewableItemsChanged = function (info) {
            info.viewableItems.forEach(function (viewToken) {
                var _a;
                expect((_a = viewToken.index) === null || _a === void 0 ? void 0 : _a.toString()).toBe(viewToken.item);
            });
        };
        var masonryFlashList = (0, mountMasonryFlashList_1.mountMasonryFlashList)({
            data: data,
            renderItem: renderItem,
            getItemType: getItemType,
            overrideItemLayout: overrideItemLayout,
            keyExtractor: keyExtractor,
            onViewableItemsChanged: onViewableItemsChanged,
        });
        jest.advanceTimersByTime(1000);
        masonryFlashList.unmount();
    });
    it("internal list height should be derived from the parent and width from itself", function () {
        var masonryFlashList = (0, mountMasonryFlashList_1.mountMasonryFlashList)({
            testID: "MasonryProxyScrollView",
        });
        expect(masonryFlashList.findAll(recyclerlistview_1.ProgressiveListView).length).toBe(3);
        masonryFlashList.findAll(react_native_1.View).forEach(function (view) {
            var _a, _b;
            (_b = (_a = view.props) === null || _a === void 0 ? void 0 : _a.onLayout) === null || _b === void 0 ? void 0 : _b.call(_a, {
                nativeEvent: { layout: { width: 500, height: 500 } },
            });
        });
        masonryFlashList.findAll(recyclerlistview_1.ProgressiveListView).forEach(function (list, index) {
            if (index !== 0) {
                expect(list.instance.getRenderedSize().width).toBe(500);
                expect(list.instance.getRenderedSize().height).toBe(900);
            }
        });
        masonryFlashList.unmount();
    });
    it("can optimize item arrangement", function () {
        var columnCount = 3;
        var data = new Array(999).fill(null).map(function (_, index) {
            return "1";
        });
        var masonryFlashList = (0, mountMasonryFlashList_1.mountMasonryFlashList)({
            data: data,
            optimizeItemArrangement: true,
            numColumns: columnCount,
            overrideItemLayout: function (layout, _, index, __, ___) {
                layout.size = ((index * 10) % 100) + 100 / ((index % columnCount) + 1);
            },
        });
        expect(masonryFlashList.findAll(recyclerlistview_1.ProgressiveListView).length).toBe(4);
        // I've verified that the following values are correct by observing the algorithm in action
        // Captured values will help prevent regression in the future
        expect(Math.floor(masonryFlashList
            .findAll(recyclerlistview_1.ProgressiveListView)[1]
            .instance.getContentDimension().height)).toBe(35306);
        expect(Math.floor(masonryFlashList
            .findAll(recyclerlistview_1.ProgressiveListView)[2]
            .instance.getContentDimension().height)).toBe(35313);
        expect(Math.floor(masonryFlashList
            .findAll(recyclerlistview_1.ProgressiveListView)[3]
            .instance.getContentDimension().height)).toBe(35339);
    });
    it("applies horizontal content container padding to the list", function () {
        var masonryFlashList = (0, mountMasonryFlashList_1.mountMasonryFlashList)({
            numColumns: 4,
            contentContainerStyle: { paddingHorizontal: 10 },
        });
        expect(masonryFlashList.findAll(recyclerlistview_1.ProgressiveListView).length).toBe(5);
        masonryFlashList.findAll(recyclerlistview_1.ProgressiveListView).forEach(function (list, index) {
            if (index === 0) {
                expect(list.instance.getRenderedSize().width).toBe(400);
                expect(list.instance.getRenderedSize().height).toBe(900);
            }
            else {
                expect(list.instance.getRenderedSize().width).toBe(95);
                expect(list.instance.getRenderedSize().height).toBe(900);
            }
        });
        masonryFlashList.unmount();
    });
    it("divides columns equally if no getColumnFlex is passed", function () {
        var masonryFlashList = (0, mountMasonryFlashList_1.mountMasonryFlashList)({
            numColumns: 4,
        });
        var progressiveListView = masonryFlashList.find(recyclerlistview_1.ProgressiveListView).instance;
        expect(progressiveListView.getLayout(0).width).toBe(100);
        expect(progressiveListView.getLayout(1).width).toBe(100);
        expect(progressiveListView.getLayout(2).width).toBe(100);
        expect(progressiveListView.getLayout(3).width).toBe(100);
    });
});
//# sourceMappingURL=MasonryFlashList.test.js.map