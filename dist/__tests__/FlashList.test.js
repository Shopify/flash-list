"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importStar(require("react"));
var react_native_1 = require("react-native");
require("@quilted/react-testing/matchers");
var recyclerlistview_1 = require("recyclerlistview");
var Warnings_1 = tslib_1.__importDefault(require("../errors/Warnings"));
var AutoLayoutView_1 = tslib_1.__importDefault(require("../native/auto-layout/AutoLayoutView"));
var CellContainer_1 = tslib_1.__importDefault(require("../native/cell-container/CellContainer"));
var FlashListProps_1 = require("../FlashListProps");
var mountFlashList_1 = require("./helpers/mountFlashList");
jest.mock("../native/cell-container/CellContainer", function () {
    return jest.requireActual("../native/cell-container/CellContainer.ios.ts")
        .default;
});
describe("FlashList", function () {
    beforeEach(function () {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });
    it("renders items", function () {
        var flashList = (0, mountFlashList_1.mountFlashList)();
        expect(flashList).toContainReactComponent(react_native_1.Text, { children: "One" });
        expect(flashList).toContainReactComponent(recyclerlistview_1.ProgressiveListView, {
            isHorizontal: false,
        });
    });
    it("sets ProgressiveListView to horizontal", function () {
        var flashList = (0, mountFlashList_1.mountFlashList)({ horizontal: true });
        expect(flashList).toContainReactComponent(recyclerlistview_1.ProgressiveListView, {
            isHorizontal: true,
        });
    });
    it("calls prepareForLayoutAnimationRender", function () {
        var flashList = (0, mountFlashList_1.mountFlashList)({
            keyExtractor: function (item) { return item; },
        });
        var warn = jest.spyOn(console, "warn").mockReturnValue();
        var prepareForLayoutAnimationRender = jest.spyOn(flashList.instance.recyclerlistview_unsafe, "prepareForLayoutAnimationRender");
        flashList.instance.prepareForLayoutAnimationRender();
        expect(prepareForLayoutAnimationRender).toHaveBeenCalledTimes(1);
        expect(warn).not.toHaveBeenCalled();
    });
    it("sends a warning when prepareForLayoutAnimationRender without keyExtractor", function () {
        var flashList = (0, mountFlashList_1.mountFlashList)();
        var warn = jest.spyOn(console, "warn").mockReturnValue();
        var prepareForLayoutAnimationRender = jest.spyOn(flashList.instance.recyclerlistview_unsafe, "prepareForLayoutAnimationRender");
        flashList.instance.prepareForLayoutAnimationRender();
        expect(prepareForLayoutAnimationRender).not.toHaveBeenCalled();
        expect(warn).toHaveBeenCalledWith(Warnings_1.default.missingKeyExtractor);
    });
    it("disables initial scroll correction on recyclerlistview if initialScrollIndex is in first row", function () {
        var flashList = (0, mountFlashList_1.mountFlashList)({ initialScrollIndex: 0, numColumns: 3 });
        expect(flashList.instance["getUpdatedWindowCorrectionConfig"]()
            .applyToInitialOffset).toBe(false);
        flashList = (0, mountFlashList_1.mountFlashList)({ initialScrollIndex: 3, numColumns: 3 });
        expect(flashList.instance["getUpdatedWindowCorrectionConfig"]()
            .applyToInitialOffset).toBe(true);
        flashList = (0, mountFlashList_1.mountFlashList)({ initialScrollIndex: 2, numColumns: 3 });
        expect(flashList.instance["getUpdatedWindowCorrectionConfig"]()
            .applyToInitialOffset).toBe(false);
    });
    it("assigns distance from window to window correction object", function () {
        var flashList = (0, mountFlashList_1.mountFlashList)({ estimatedFirstItemOffset: 100 });
        expect(flashList.instance["getUpdatedWindowCorrectionConfig"]().value.windowShift).toBe(-100);
    });
    it("only forwards onBlankArea prop to AutoLayout when needed", function () {
        var _a;
        var flashList = (0, mountFlashList_1.mountFlashList)();
        var autoLayoutView = (_a = flashList.find(AutoLayoutView_1.default)) === null || _a === void 0 ? void 0 : _a.instance;
        expect(autoLayoutView.props.onBlankAreaEvent).toBeUndefined();
        flashList.setProps({ onBlankArea: function () { } });
        expect(autoLayoutView.props.onBlankAreaEvent).not.toBeUndefined();
    });
    it("calls render item only when data of the items has changed", function () {
        var renderItemMock = jest.fn(function (_a) {
            var item = _a.item;
            return react_1.default.createElement(react_native_1.Text, null, item);
        });
        var flashList = (0, mountFlashList_1.mountFlashList)({
            renderItem: renderItemMock,
            data: ["One", "Two", "Three", "Four"],
        });
        // because we have 4 data items
        expect(renderItemMock).toHaveBeenCalledTimes(4);
        // reset counter
        renderItemMock.mockClear();
        // changes layout of all four items
        flashList.setProps({ numColumns: 2 });
        // render item should be called 0 times because only layout of items would have changed
        expect(renderItemMock).toHaveBeenCalledTimes(0);
        flashList.unmount();
    });
    it("keeps component mounted based on prepareForLayoutAnimationRender being called", function () {
        // Tracks components being unmounted
        var unmountMock = jest.fn();
        var Item = function (_a) {
            var text = _a.text;
            (0, react_1.useEffect)(function () {
                return unmountMock;
            }, []);
            return react_1.default.createElement(react_native_1.Text, null, text);
        };
        var flashList = (0, mountFlashList_1.mountFlashList)({
            keyExtractor: function (item) { return item; },
            renderItem: function (_a) {
                var item = _a.item;
                return react_1.default.createElement(Item, { text: item });
            },
            data: ["One", "Two", "Three", "Four"],
        });
        // Change data without prepareForLayoutAnimationRender
        flashList.setProps({ data: ["One", "Two", "Three", "Five"] });
        expect(unmountMock).not.toHaveBeenCalled();
        // Before changing data, we run prepareForLayoutAnimationRender.
        // This ensures component gets unmounted instead of being recycled to ensure layout animations run as expected.
        flashList.instance.prepareForLayoutAnimationRender();
        flashList.setProps({ data: ["One", "Two", "Three", "Six"] });
        expect(unmountMock).toHaveBeenCalledTimes(1);
    });
    it("fires onLoad event", function () {
        var _a;
        var onLoadMock = jest.fn();
        // empty list
        (0, mountFlashList_1.mountFlashList)({ data: [], onLoad: onLoadMock });
        expect(onLoadMock).toHaveBeenCalledWith({
            elapsedTimeInMs: expect.any(Number),
        });
        onLoadMock.mockClear();
        // non-empty list
        var flashList = (0, mountFlashList_1.mountFlashList)({ onLoad: onLoadMock });
        (_a = flashList.find(recyclerlistview_1.ProgressiveListView)) === null || _a === void 0 ? void 0 : _a.instance.onItemLayout(0);
        expect(onLoadMock).toHaveBeenCalledWith({
            elapsedTimeInMs: expect.any(Number),
        });
    });
    it("loads an empty state", function () {
        var EmptyComponent = function () {
            return react_1.default.createElement(react_native_1.Text, null, "Empty");
        };
        var flashList = (0, mountFlashList_1.mountFlashList)({
            data: [],
            ListEmptyComponent: EmptyComponent,
        });
        expect(flashList).toContainReactComponent(EmptyComponent);
    });
    it("loads header and footer in empty state", function () {
        var HeaderComponent = function () {
            return react_1.default.createElement(react_native_1.Text, null, "Empty");
        };
        var FooterComponent = function () {
            return react_1.default.createElement(react_native_1.Text, null, "Empty");
        };
        var flashList = (0, mountFlashList_1.mountFlashList)({
            data: [],
            ListHeaderComponent: HeaderComponent,
            ListFooterComponent: FooterComponent,
        });
        expect(flashList).toContainReactComponent(HeaderComponent);
        expect(flashList).toContainReactComponent(FooterComponent);
    });
    it("reports layout changes to the layout provider", function () {
        var _a;
        var flashList = (0, mountFlashList_1.mountFlashList)();
        var reportItemLayoutMock = jest.spyOn(flashList.instance.state.layoutProvider, "reportItemLayout");
        (_a = flashList.find(recyclerlistview_1.ProgressiveListView)) === null || _a === void 0 ? void 0 : _a.instance.onItemLayout(0);
        expect(reportItemLayoutMock).toHaveBeenCalledWith(0);
        flashList.unmount();
    });
    it("should prefer overrideItemLayout over estimate and average", function () {
        var flashList = (0, mountFlashList_1.mountFlashList)({
            overrideItemLayout: function (layout) {
                layout.size = 50;
            },
        });
        expect(flashList.instance.state.layoutProvider.averageItemSize).toBe(200);
        expect(flashList.instance.state
            .layoutProvider.getLayoutManager()
            .getLayouts()[0].height).toBe(50);
    });
    it("should override span with overrideItemLayout", function () {
        var renderItemMock = jest.fn(function (_a) {
            var item = _a.item;
            return react_1.default.createElement(react_native_1.Text, null, item);
        });
        (0, mountFlashList_1.mountFlashList)({
            overrideItemLayout: function (layout) {
                layout.span = 2;
            },
            numColumns: 2,
            estimatedItemSize: 300,
            renderItem: renderItemMock,
        });
        expect(renderItemMock).toHaveBeenCalledTimes(3);
        renderItemMock.mockClear();
        (0, mountFlashList_1.mountFlashList)({
            overrideItemLayout: function (layout, _, index) {
                if (index > 2) {
                    layout.span = 2;
                }
            },
            data: new Array(20).fill(""),
            numColumns: 3,
            estimatedItemSize: 100,
            renderItem: renderItemMock,
        });
        expect(renderItemMock).toHaveBeenCalledTimes(11);
    });
    it("overrideItemLayout should consider 0 as a valid span", function () {
        var renderItemMock = jest.fn(function (_a) {
            var item = _a.item;
            return react_1.default.createElement(react_native_1.Text, null, item);
        });
        (0, mountFlashList_1.mountFlashList)({
            overrideItemLayout: function (layout, _, index) {
                if (index < 4) {
                    layout.span = 0;
                }
            },
            data: new Array(20).fill(""),
            numColumns: 2,
            renderItem: renderItemMock,
        });
        expect(renderItemMock).toHaveBeenCalledTimes(14);
    });
    it("reports onViewableItemsChanged for viewable items", function () {
        var _a, _b, _c, _d;
        var onViewableItemsChanged = jest.fn();
        var onViewableItemsChangedForItemVisiblePercentThreshold = jest.fn();
        var flashList = (0, mountFlashList_1.mountFlashList)({
            estimatedItemSize: 300,
            viewabilityConfig: {
                minimumViewTime: 250,
            },
            viewabilityConfigCallbackPairs: [
                {
                    onViewableItemsChanged: onViewableItemsChangedForItemVisiblePercentThreshold,
                    viewabilityConfig: {
                        itemVisiblePercentThreshold: 50,
                        waitForInteraction: true,
                    },
                },
            ],
            onViewableItemsChanged: onViewableItemsChanged,
        });
        // onViewableItemsChanged is not called before 250 ms have elapsed
        expect(onViewableItemsChanged).not.toHaveBeenCalled();
        jest.advanceTimersByTime(250);
        // Initial viewable items
        expect(onViewableItemsChanged).toHaveBeenCalledWith({
            changed: [
                {
                    index: 0,
                    isViewable: true,
                    item: "One",
                    key: "0",
                    timestamp: expect.any(Number),
                },
                {
                    index: 1,
                    isViewable: true,
                    item: "Two",
                    key: "1",
                    timestamp: expect.any(Number),
                },
                {
                    index: 2,
                    isViewable: true,
                    item: "Three",
                    key: "2",
                    timestamp: expect.any(Number),
                },
            ],
            viewableItems: [
                {
                    index: 0,
                    isViewable: true,
                    item: "One",
                    key: "0",
                    timestamp: expect.any(Number),
                },
                {
                    index: 1,
                    isViewable: true,
                    item: "Two",
                    key: "1",
                    timestamp: expect.any(Number),
                },
                {
                    index: 2,
                    isViewable: true,
                    item: "Three",
                    key: "2",
                    timestamp: expect.any(Number),
                },
            ],
        });
        expect(onViewableItemsChangedForItemVisiblePercentThreshold).not.toHaveBeenCalled();
        // onViewableItemsChangedForItemVisiblePercentThreshold waits for interaction before reporting viewable items
        flashList.instance.recordInteraction();
        jest.advanceTimersByTime(250);
        expect(onViewableItemsChangedForItemVisiblePercentThreshold).toHaveBeenCalledWith({
            changed: [
                {
                    index: 0,
                    isViewable: true,
                    item: "One",
                    key: "0",
                    timestamp: expect.any(Number),
                },
                {
                    index: 1,
                    isViewable: true,
                    item: "Two",
                    key: "1",
                    timestamp: expect.any(Number),
                },
                {
                    index: 2,
                    isViewable: true,
                    item: "Three",
                    key: "2",
                    timestamp: expect.any(Number),
                },
            ],
            viewableItems: [
                {
                    index: 0,
                    isViewable: true,
                    item: "One",
                    key: "0",
                    timestamp: expect.any(Number),
                },
                {
                    index: 1,
                    isViewable: true,
                    item: "Two",
                    key: "1",
                    timestamp: expect.any(Number),
                },
                {
                    index: 2,
                    isViewable: true,
                    item: "Three",
                    key: "2",
                    timestamp: expect.any(Number),
                },
            ],
        });
        onViewableItemsChanged.mockReset();
        onViewableItemsChangedForItemVisiblePercentThreshold.mockReset();
        // Mocking a scroll that will make the first item not visible and the last item visible
        jest
            .spyOn(flashList.instance.recyclerlistview_unsafe, "getCurrentScrollOffset")
            .mockReturnValue(200);
        (_b = (_a = flashList.instance.recyclerlistview_unsafe.props).onVisibleIndicesChanged) === null || _b === void 0 ? void 0 : _b.call(_a, [0, 1, 2, 3], [], []);
        (_d = (_c = flashList.instance.recyclerlistview_unsafe.props).onScroll) === null || _d === void 0 ? void 0 : _d.call(_c, { nativeEvent: { contentOffset: { x: 0, y: 200 } } }, 0, 200);
        jest.advanceTimersByTime(250);
        expect(onViewableItemsChanged).toHaveBeenCalledWith({
            changed: [
                {
                    index: 3,
                    isViewable: true,
                    item: "Four",
                    key: "3",
                    timestamp: expect.any(Number),
                },
            ],
            viewableItems: [
                {
                    index: 0,
                    isViewable: true,
                    item: "One",
                    key: "0",
                    timestamp: expect.any(Number),
                },
                {
                    index: 1,
                    isViewable: true,
                    item: "Two",
                    key: "1",
                    timestamp: expect.any(Number),
                },
                {
                    index: 2,
                    isViewable: true,
                    item: "Three",
                    key: "2",
                    timestamp: expect.any(Number),
                },
                {
                    index: 3,
                    isViewable: true,
                    item: "Four",
                    key: "3",
                    timestamp: expect.any(Number),
                },
            ],
        });
        expect(onViewableItemsChangedForItemVisiblePercentThreshold).toHaveBeenCalledWith({
            changed: [
                {
                    index: 3,
                    isViewable: true,
                    item: "Four",
                    key: "3",
                    timestamp: expect.any(Number),
                },
                {
                    index: 0,
                    isViewable: false,
                    item: "One",
                    key: "0",
                    timestamp: expect.any(Number),
                },
            ],
            viewableItems: [
                {
                    index: 1,
                    isViewable: true,
                    item: "Two",
                    key: "1",
                    timestamp: expect.any(Number),
                },
                {
                    index: 2,
                    isViewable: true,
                    item: "Three",
                    key: "2",
                    timestamp: expect.any(Number),
                },
                {
                    index: 3,
                    isViewable: true,
                    item: "Four",
                    key: "3",
                    timestamp: expect.any(Number),
                },
            ],
        });
    });
    it("viewability reports take into account estimatedFirstItemOffset", function () {
        var onViewableItemsChanged = jest.fn();
        (0, mountFlashList_1.mountFlashList)({
            estimatedFirstItemOffset: 200,
            estimatedItemSize: 300,
            onViewableItemsChanged: onViewableItemsChanged,
            viewabilityConfig: { itemVisiblePercentThreshold: 50 },
        });
        // onViewableItemsChanged is not called before 250 ms have elapsed
        expect(onViewableItemsChanged).not.toHaveBeenCalled();
        jest.advanceTimersByTime(250);
        // Initial viewable items
        expect(onViewableItemsChanged).toHaveBeenCalledWith({
            changed: [
                {
                    index: 0,
                    isViewable: true,
                    item: "One",
                    key: "0",
                    timestamp: expect.any(Number),
                },
                {
                    index: 1,
                    isViewable: true,
                    item: "Two",
                    key: "1",
                    timestamp: expect.any(Number),
                },
            ],
            viewableItems: [
                {
                    index: 0,
                    isViewable: true,
                    item: "One",
                    key: "0",
                    timestamp: expect.any(Number),
                },
                {
                    index: 1,
                    isViewable: true,
                    item: "Two",
                    key: "1",
                    timestamp: expect.any(Number),
                },
            ],
        });
    });
    it("should not overlap header with sitcky index 0", function () {
        var HeaderComponent = function () {
            return react_1.default.createElement(react_native_1.Text, null, "Empty");
        };
        var flashList = (0, mountFlashList_1.mountFlashList)({
            ListHeaderComponent: HeaderComponent,
            stickyHeaderIndices: [0],
        });
        // If sticky renders there'll be 6
        expect(flashList.findAll(react_native_1.Text).length).toBe(5);
    });
    it("rerenders all items when layout manager changes", function () {
        var _a;
        var countMounts = 0;
        var currentId = 0;
        // Effect will be triggered once per mount
        var RenderComponent = function (_a) {
            var id = _a.id;
            (0, react_1.useEffect)(function () {
                countMounts++;
            }, [id]);
            return react_1.default.createElement(react_native_1.Text, null, "Test");
        };
        var renderItem = function () {
            return react_1.default.createElement(RenderComponent, { id: currentId });
        };
        var flashList = (0, mountFlashList_1.mountFlashList)({
            data: new Array(100).fill("1"),
            estimatedItemSize: 70,
            renderItem: renderItem,
        });
        var scrollTo = function (y) {
            var _a;
            (_a = flashList.find(react_native_1.ScrollView)) === null || _a === void 0 ? void 0 : _a.trigger("onScroll", {
                nativeEvent: { contentOffset: { x: 0, y: y } },
            });
        };
        // Mocking some scrolls
        scrollTo(200);
        scrollTo(400);
        scrollTo(600);
        scrollTo(3000);
        scrollTo(2000);
        // changing id will trigger effects if components rerender
        currentId = 1;
        // capturing current component count to check later
        var currentComponentCount = countMounts;
        // resetting count
        countMounts = 0;
        // items widths before layout manager change should be 400
        flashList.findAll(CellContainer_1.default).forEach(function (cell) {
            if (cell.props.index !== -1) {
                expect(cell.instance.props.style.width).toBe(400);
            }
        });
        // This will cause a layout manager change
        (_a = flashList.find(react_native_1.ScrollView)) === null || _a === void 0 ? void 0 : _a.trigger("onLayout", {
            nativeEvent: { layout: { height: 400, width: 900 } },
        });
        // If counts match, then all components were updated
        expect(countMounts).toBe(currentComponentCount);
        // items widths after layout manager change should be 900
        flashList.findAll(CellContainer_1.default).forEach(function (cell) {
            if (cell.props.index !== -1) {
                expect(cell.instance.props.style.width).toBe(900);
            }
        });
        flashList.unmount();
    });
    it("sends a warning when estimatedItemSize is not set", function () {
        var _a, _b, _c;
        var warn = jest.spyOn(console, "warn").mockReturnValue();
        var flashList = (0, mountFlashList_1.mountFlashList)({
            disableDefaultEstimatedItemSize: true,
            renderItem: function (_a) {
                var item = _a.item;
                return react_1.default.createElement(react_native_1.Text, { style: { height: 200 } }, item);
            },
        });
        var layoutData = flashList.instance.state.layoutProvider
            .getLayoutManager()
            .getLayouts();
        layoutData[0].height = 100;
        layoutData[1].height = 200;
        layoutData[2].height = 300;
        (_a = flashList.find(recyclerlistview_1.ProgressiveListView)) === null || _a === void 0 ? void 0 : _a.instance.onItemLayout(0);
        expect(flashList.instance.state.layoutProvider.averageItemSize).toBe(100);
        (_b = flashList.find(recyclerlistview_1.ProgressiveListView)) === null || _b === void 0 ? void 0 : _b.instance.onItemLayout(1);
        (_c = flashList.find(recyclerlistview_1.ProgressiveListView)) === null || _c === void 0 ? void 0 : _c.instance.onItemLayout(2);
        jest.advanceTimersByTime(1000);
        var averageItemSize = flashList.instance.state.layoutProvider.averageItemSize;
        expect(warn).toHaveBeenCalledWith(Warnings_1.default.estimatedItemSizeMissingWarning.replace("@size", averageItemSize.toString()));
        expect(flashList.instance.state.layoutProvider.averageItemSize).toBe(175);
        flashList.unmount();
    });
    it("clears size warning timeout on unmount", function () {
        var _a;
        var warn = jest.spyOn(console, "warn").mockReturnValue();
        var flashList = (0, mountFlashList_1.mountFlashList)({
            disableDefaultEstimatedItemSize: true,
        });
        (_a = flashList.find(recyclerlistview_1.ProgressiveListView)) === null || _a === void 0 ? void 0 : _a.instance.onItemLayout(0);
        flashList.unmount();
        jest.advanceTimersByTime(1000);
        expect(warn).toBeCalledTimes(0);
    });
    it("measure size of horizontal list when appropriate", function () {
        var flashList = (0, mountFlashList_1.mountFlashList)({
            data: new Array(1).fill("1"),
            horizontal: true,
        });
        var forceUpdate = jest.spyOn(flashList.instance, "forceUpdate");
        // should contain 1 actual text and 1 dummy on mount
        expect(flashList.findAll(react_native_1.Text).length).toBe(2);
        // Trigger onLoad
        flashList.instance["onItemLayout"](0);
        jest.advanceTimersByTime(600);
        expect(forceUpdate).toBeCalledTimes(1);
        // TODO: Investigate why forceUpdate isn't working in tests, forcing an update
        flashList.setProps({ overrideItemLayout: function () { } });
        // After update the dummy should get removed
        expect(flashList.findAll(react_native_1.Text).length).toBe(1);
        flashList.unmount();
        flashList = (0, mountFlashList_1.mountFlashList)({
            data: new Array(1).fill("1"),
            horizontal: true,
            disableHorizontalListHeightMeasurement: true,
        });
        // should contain 1 actual text as measurement is disabled
        expect(flashList.findAll(react_native_1.Text).length).toBe(1);
        flashList.unmount();
    });
    it("cancels post load setTimeout on unmount", function () {
        var flashList = (0, mountFlashList_1.mountFlashList)({
            data: new Array(1).fill("1"),
            horizontal: true,
        });
        var forceUpdate = jest.spyOn(flashList.instance, "forceUpdate");
        flashList.instance["onItemLayout"](0);
        flashList.unmount();
        jest.advanceTimersByTime(600);
        expect(forceUpdate).toBeCalledTimes(0);
    });
    it("uses 250 as draw distance on Android/iOS", function () {
        var _a, _b;
        var flashList = (0, mountFlashList_1.mountFlashList)();
        (_a = flashList.find(recyclerlistview_1.ProgressiveListView)) === null || _a === void 0 ? void 0 : _a.instance.onItemLayout(0);
        jest.advanceTimersByTime(1000);
        expect((_b = flashList
            .find(recyclerlistview_1.ProgressiveListView)) === null || _b === void 0 ? void 0 : _b.instance.getCurrentRenderAheadOffset()).toBe(250);
        flashList.unmount();
    });
    it("forwards correct renderTarget", function () {
        var _a, _b, _c, _d, _e;
        var renderItem = function (_a) {
            var target = _a.target;
            return react_1.default.createElement(react_native_1.Text, null, target);
        };
        var flashList = (0, mountFlashList_1.mountFlashList)({
            data: ["0"],
            stickyHeaderIndices: [0],
            renderItem: renderItem,
        });
        expect((_b = (_a = flashList.find(react_native_1.Animated.View)) === null || _a === void 0 ? void 0 : _a.find(react_native_1.Text)) === null || _b === void 0 ? void 0 : _b.props.children).toBe(FlashListProps_1.RenderTargetOptions.StickyHeader);
        expect((_d = (_c = flashList.find(react_native_1.View)) === null || _c === void 0 ? void 0 : _c.find(react_native_1.Text)) === null || _d === void 0 ? void 0 : _d.props.children).toBe(FlashListProps_1.RenderTargetOptions.Cell);
        var flashListHorizontal = (0, mountFlashList_1.mountFlashList)({
            renderItem: renderItem,
            horizontal: true,
        });
        expect((_e = flashListHorizontal
            .findAllWhere(function (node) { var _a, _b; return ((_b = (_a = node === null || node === void 0 ? void 0 : node.props) === null || _a === void 0 ? void 0 : _a.style) === null || _b === void 0 ? void 0 : _b.opacity) === 0; })[0]
            .find(react_native_1.Text)) === null || _e === void 0 ? void 0 : _e.props.children).toBe("Measurement");
    });
    it("force updates items only when renderItem change", function () {
        var renderItem = jest.fn(function () { return react_1.default.createElement(react_native_1.Text, null, "Test"); });
        var flashList = (0, mountFlashList_1.mountFlashList)({
            data: new Array(1).fill("1"),
            renderItem: renderItem,
        });
        flashList.setProps({ data: new Array(1).fill("1") });
        expect(renderItem).toBeCalledTimes(1);
        var newRenderItem = jest.fn(function () { return react_1.default.createElement(react_native_1.Text, null, "Test"); });
        flashList.setProps({
            data: new Array(1).fill("1"),
            renderItem: newRenderItem,
        });
        expect(newRenderItem).toBeCalledTimes(1);
    });
    it("forwards disableAutoLayout prop correctly", function () {
        var _a, _b;
        var flashList = (0, mountFlashList_1.mountFlashList)();
        expect((_a = flashList.find(AutoLayoutView_1.default)) === null || _a === void 0 ? void 0 : _a.props.disableAutoLayout).toBe(undefined);
        flashList.setProps({ disableAutoLayout: true });
        expect((_b = flashList.find(AutoLayoutView_1.default)) === null || _b === void 0 ? void 0 : _b.props.disableAutoLayout).toBe(true);
    });
    it("computes correct scrollTo offset when view position is specified", function () {
        var _a;
        var flashList = (0, mountFlashList_1.mountFlashList)({
            data: new Array(40).fill(1).map(function (_, index) {
                return index.toString();
            }),
        });
        var plv = (_a = flashList.find(recyclerlistview_1.ProgressiveListView)) === null || _a === void 0 ? void 0 : _a.instance;
        var scrollToOffset = jest.spyOn(plv, "scrollToOffset");
        flashList.instance.scrollToIndex({ index: 10, viewPosition: 0.5 });
        // Each item is 200px in height and to position it in the middle of the window (900 x 400), its offset needs to be
        // reduced by 350px. That gives us 1650. Other test cases follow the same logic.
        expect(scrollToOffset).toBeCalledWith(1650, 1650, false, true);
        flashList.instance.scrollToItem({
            item: "10",
            viewPosition: 0.5,
        });
        expect(scrollToOffset).toBeCalledWith(1650, 1650, false, true);
        flashList.setProps({ horizontal: true });
        flashList.instance.scrollToItem({
            item: "10",
            viewPosition: 0.5,
        });
        expect(scrollToOffset).toBeCalledWith(1900, 1900, false, true);
        flashList.unmount();
    });
    it("computes correct scrollTo offset when view offset is specified", function () {
        var _a;
        var flashList = (0, mountFlashList_1.mountFlashList)({
            data: new Array(40).fill(1).map(function (_, index) {
                return index.toString();
            }),
        });
        var plv = (_a = flashList.find(recyclerlistview_1.ProgressiveListView)) === null || _a === void 0 ? void 0 : _a.instance;
        var scrollToOffset = jest.spyOn(plv, "scrollToOffset");
        // Each item is 200px in height and to position it in the middle of the window (900 x 400), it's offset needs to be
        // reduced by 350px + 100px offset. That gives us 1550. Other test cases follow the same logic.
        flashList.instance.scrollToIndex({
            index: 10,
            viewPosition: 0.5,
            viewOffset: 100,
        });
        expect(scrollToOffset).toBeCalledWith(1550, 1550, false, true);
        flashList.setProps({ horizontal: true });
        flashList.instance.scrollToItem({
            item: "10",
            viewPosition: 0.5,
            viewOffset: 100,
        });
        expect(scrollToOffset).toBeCalledWith(1800, 1800, false, true);
        flashList.unmount();
    });
    it("applies horizontal content container padding for vertical list", function () {
        var flashList = (0, mountFlashList_1.mountFlashList)({
            numColumns: 4,
            contentContainerStyle: { paddingHorizontal: 10 },
        });
        var hasLayoutItems = false;
        flashList.instance.state.layoutProvider
            .getLayoutManager()
            .getLayouts()
            .forEach(function (layout) {
            hasLayoutItems = true;
            expect(layout.width).toBe(95);
        });
        expect(hasLayoutItems).toBe(true);
        flashList.unmount();
    });
    it("applies vertical content container padding for horizontal list", function () {
        var flashList = (0, mountFlashList_1.mountFlashList)({
            horizontal: true,
            contentContainerStyle: { paddingVertical: 10 },
        });
        var hasLayoutItems = false;
        flashList.instance.state.layoutProvider
            .getLayoutManager()
            .getLayouts()
            .forEach(function (layout) {
            hasLayoutItems = true;
            expect(layout.height).toBe(880);
        });
        expect(hasLayoutItems).toBe(true);
        flashList.unmount();
    });
});
//# sourceMappingURL=FlashList.test.js.map