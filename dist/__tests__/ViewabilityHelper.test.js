"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var CustomError_1 = tslib_1.__importDefault(require("../errors/CustomError"));
var ExceptionList_1 = tslib_1.__importDefault(require("../errors/ExceptionList"));
var ViewabilityHelper_1 = tslib_1.__importDefault(require("../viewability/ViewabilityHelper"));
describe("ViewabilityHelper", function () {
    var viewableIndicesChanged = jest.fn();
    beforeEach(function () {
        jest.resetAllMocks();
        jest.useFakeTimers();
    });
    it("does not report any changes when indices have not changed", function () {
        var viewabilityHelper = new ViewabilityHelper_1.default(null, viewableIndicesChanged);
        viewabilityHelper.possiblyViewableIndices = [0, 1, 2];
        updateViewableItems({ viewabilityHelper: viewabilityHelper });
        // Initial call
        expect(viewableIndicesChanged).toHaveBeenCalledWith([0, 1, 2], [0, 1, 2], []);
        // No changes
        viewableIndicesChanged.mockReset();
        updateViewableItems({ viewabilityHelper: viewabilityHelper });
        expect(viewableIndicesChanged).not.toHaveBeenCalled();
    });
    it("reports only viewable indices", function () {
        var viewabilityHelper = new ViewabilityHelper_1.default(null, viewableIndicesChanged);
        viewabilityHelper.possiblyViewableIndices = [0, 1, 2, 3];
        updateViewableItems({ viewabilityHelper: viewabilityHelper });
        // Items 0, 1, 2 are initially viewable
        expect(viewableIndicesChanged).toHaveBeenCalledWith([0, 1, 2], [0, 1, 2], []);
        // After scroll, item 3 becomes viewable, too
        updateViewableItems({ viewabilityHelper: viewabilityHelper, scrollOffset: 50 });
        expect(viewableIndicesChanged).toHaveBeenCalledWith([0, 1, 2, 3], [3], []);
        // After additional scroll, the first item is no longer viewable
        updateViewableItems({ viewabilityHelper: viewabilityHelper, scrollOffset: 100 });
        expect(viewableIndicesChanged).toHaveBeenCalledWith([1, 2, 3], [], [0]);
    });
    it("reports only viewable indices when horizontal", function () {
        var viewabilityHelper = new ViewabilityHelper_1.default(null, viewableIndicesChanged);
        viewabilityHelper.possiblyViewableIndices = [0, 1, 2, 3];
        var getLayout = function (index) {
            return { x: index * 100, y: 0, height: 300, width: 100 };
        };
        updateViewableItems({ viewabilityHelper: viewabilityHelper, horizontal: true, getLayout: getLayout });
        expect(viewableIndicesChanged).toHaveBeenCalledWith([0, 1, 2], [0, 1, 2], []);
        updateViewableItems({
            viewabilityHelper: viewabilityHelper,
            horizontal: true,
            scrollOffset: 50,
            getLayout: getLayout,
        });
        expect(viewableIndicesChanged).toHaveBeenCalledWith([0, 1, 2, 3], [3], []);
        updateViewableItems({
            viewabilityHelper: viewabilityHelper,
            horizontal: true,
            scrollOffset: 100,
            getLayout: getLayout,
        });
        expect(viewableIndicesChanged).toHaveBeenCalledWith([1, 2, 3], [], [0]);
    });
    it("reports items only after minimumViewTime has elapsed", function () {
        var viewabilityHelper = new ViewabilityHelper_1.default({ minimumViewTime: 500 }, viewableIndicesChanged);
        viewabilityHelper.possiblyViewableIndices = [0, 1, 2, 3];
        updateViewableItems({ viewabilityHelper: viewabilityHelper, runAllTimers: false });
        expect(viewableIndicesChanged).not.toHaveBeenCalled();
        jest.advanceTimersByTime(400);
        expect(viewableIndicesChanged).not.toHaveBeenCalled();
        jest.advanceTimersByTime(100);
        expect(viewableIndicesChanged).toHaveBeenCalledWith([0, 1, 2], [0, 1, 2], []);
        viewableIndicesChanged.mockReset();
        updateViewableItems({
            viewabilityHelper: viewabilityHelper,
            scrollOffset: 50,
            runAllTimers: false,
        });
        expect(viewableIndicesChanged).not.toHaveBeenCalled();
        jest.advanceTimersByTime(500);
        expect(viewableIndicesChanged).toHaveBeenCalledWith([0, 1, 2, 3], [3], []);
        viewableIndicesChanged.mockReset();
        updateViewableItems({
            viewabilityHelper: viewabilityHelper,
            scrollOffset: 100,
            runAllTimers: false,
        });
        expect(viewableIndicesChanged).not.toHaveBeenCalled();
        jest.advanceTimersByTime(500);
        expect(viewableIndicesChanged).toHaveBeenCalledWith([1, 2, 3], [], [0]);
    });
    it("reports items that only satisfy itemVisiblePercentThreshold", function () {
        var viewabilityHelper = new ViewabilityHelper_1.default({ itemVisiblePercentThreshold: 50 }, viewableIndicesChanged);
        viewabilityHelper.possiblyViewableIndices = [0, 1, 2, 3];
        updateViewableItems({
            viewabilityHelper: viewabilityHelper,
        });
        expect(viewableIndicesChanged).toHaveBeenCalledWith([0, 1, 2], [0, 1, 2], []);
        viewableIndicesChanged.mockReset();
        // User scrolled by 50 pixels, making both first and last item visible from 50 %
        updateViewableItems({
            viewabilityHelper: viewabilityHelper,
            scrollOffset: 50,
        });
        expect(viewableIndicesChanged).toHaveBeenCalledWith([0, 1, 2, 3], [3], []);
        viewableIndicesChanged.mockReset();
        // User scrolled by 55 pixels, first item no longer satisfies threshold
        updateViewableItems({
            viewabilityHelper: viewabilityHelper,
            scrollOffset: 55,
        });
        expect(viewableIndicesChanged).toHaveBeenCalledWith([1, 2, 3], [], [0]);
    });
    it("reports items that only satisfy viewAreaCoveragePercentThreshold", function () {
        var getLayout = function (index) {
            if (index === 4) {
                return { x: 0, y: index * 100, width: 100, height: 25 };
            }
            return { x: 0, y: index * 100, height: 100, width: 300 };
        };
        var viewabilityHelper = new ViewabilityHelper_1.default({ viewAreaCoveragePercentThreshold: 25 }, viewableIndicesChanged);
        viewabilityHelper.possiblyViewableIndices = [0, 1, 2, 3];
        updateViewableItems({
            viewabilityHelper: viewabilityHelper,
            getLayout: getLayout,
        });
        expect(viewableIndicesChanged).toHaveBeenCalledWith([0, 1, 2], [0, 1, 2], []);
        viewableIndicesChanged.mockReset();
        // User scrolled by 75 pixels.
        // First item is visible only from 25 pixels, not meeting the threshold.
        // The last item is visible from 75 pixels, which is exactly the threshold (300 / 4 = 75 where 300 is height of the list)
        updateViewableItems({
            viewabilityHelper: viewabilityHelper,
            scrollOffset: 75,
            getLayout: getLayout,
        });
        expect(viewableIndicesChanged).toHaveBeenCalledWith([1, 2, 3], [3], [0]);
        viewableIndicesChanged.mockReset();
        // User scrolled by 110 pixels, making the last small item only partially visible, not meeting the threshold.
        viewabilityHelper.possiblyViewableIndices = [1, 2, 3, 4];
        updateViewableItems({
            viewabilityHelper: viewabilityHelper,
            scrollOffset: 110,
            getLayout: getLayout,
        });
        expect(viewableIndicesChanged).not.toHaveBeenCalled();
        // User scrolled by 125 pixels, making the last small item completely visible, even when it is not meeting the threshold.
        viewabilityHelper.possiblyViewableIndices = [1, 2, 3, 4];
        updateViewableItems({
            viewabilityHelper: viewabilityHelper,
            scrollOffset: 125,
            getLayout: getLayout,
        });
        expect(viewableIndicesChanged).toHaveBeenCalledWith([1, 2, 3, 4], [4], []);
    });
    it("reports viewable items only after interaction if waitForInteraction is set to true", function () {
        var viewabilityHelper = new ViewabilityHelper_1.default({ waitForInteraction: true }, viewableIndicesChanged);
        // Even when elements are visible, viewableIndicesChanged will not be called since interaction has not been recorded, yet
        viewabilityHelper.possiblyViewableIndices = [0, 1, 2, 3];
        updateViewableItems({
            viewabilityHelper: viewabilityHelper,
        });
        // View is scrolled but programatically - not resulting in an interaction
        updateViewableItems({
            viewabilityHelper: viewabilityHelper,
            scrollOffset: 50,
        });
        expect(viewableIndicesChanged).not.toHaveBeenCalled();
        // Interaction is recorded, leading to trigger of viewableIndicesChanged
        viewabilityHelper.hasInteracted = true;
        updateViewableItems({
            viewabilityHelper: viewabilityHelper,
            scrollOffset: 50,
        });
        expect(viewableIndicesChanged).toHaveBeenCalledWith([0, 1, 2, 3], [0, 1, 2, 3], []);
    });
    it("throws multipleViewabilityThresholdTypesNotSupported exception when both viewAreaCoveragePercentThreshold and itemVisiblePercentThreshold are defined", function () {
        var viewabilityHelper = new ViewabilityHelper_1.default({ viewAreaCoveragePercentThreshold: 1, itemVisiblePercentThreshold: 1 }, viewableIndicesChanged);
        expect(function () { return updateViewableItems({ viewabilityHelper: viewabilityHelper }); }).toThrow(new CustomError_1.default(ExceptionList_1.default.multipleViewabilityThresholdTypesNotSupported));
    });
    var updateViewableItems = function (_a) {
        var viewabilityHelper = _a.viewabilityHelper, horizontal = _a.horizontal, scrollOffset = _a.scrollOffset, listSize = _a.listSize, getLayout = _a.getLayout, runAllTimers = _a.runAllTimers;
        viewabilityHelper.updateViewableItems(horizontal !== null && horizontal !== void 0 ? horizontal : false, scrollOffset !== null && scrollOffset !== void 0 ? scrollOffset : 0, listSize !== null && listSize !== void 0 ? listSize : { height: 300, width: 300 }, getLayout !== null && getLayout !== void 0 ? getLayout : (function (index) {
            return { x: 0, y: index * 100, height: 100, width: 300 };
        }));
        if (runAllTimers !== null && runAllTimers !== void 0 ? runAllTimers : true) {
            jest.runAllTimers();
        }
    };
});
//# sourceMappingURL=ViewabilityHelper.test.js.map