"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importStar(require("react"));
var react_testing_1 = require("@quilted/react-testing");
var useBlankAreaTracker_1 = require("../benchmark/useBlankAreaTracker");
var mountFlashList_1 = require("./helpers/mountFlashList");
var BlankTrackingFlashList = function (props) {
    var _a, _b, _c, _d;
    var ref = props === null || props === void 0 ? void 0 : props.instance;
    var _e = tslib_1.__read((0, useBlankAreaTracker_1.useBlankAreaTracker)(ref, props === null || props === void 0 ? void 0 : props.onCumulativeBlankAreaChange, {
        startDelayInMs: (_b = (_a = props === null || props === void 0 ? void 0 : props.blankAreaTrackerConfig) === null || _a === void 0 ? void 0 : _a.startDelayInMs) !== null && _b !== void 0 ? _b : 500,
        sumNegativeValues: (_d = (_c = props === null || props === void 0 ? void 0 : props.blankAreaTrackerConfig) === null || _c === void 0 ? void 0 : _c.sumNegativeValues) !== null && _d !== void 0 ? _d : false,
    }), 2), blankAreaTrackerResult = _e[0], onBlankArea = _e[1];
    (0, react_1.useEffect)(function () {
        return function () {
            var _a;
            (_a = props === null || props === void 0 ? void 0 : props.onCumulativeBlankAreaResult) === null || _a === void 0 ? void 0 : _a.call(props, blankAreaTrackerResult);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (0, mountFlashList_1.renderFlashList)(tslib_1.__assign(tslib_1.__assign({}, props), { onBlankArea: onBlankArea, estimatedItemSize: 400 }), ref);
};
var mountBlankTrackingFlashList = function (props) {
    var flashListRef = {
        current: null,
    };
    var blankTrackingFlashList = (0, react_testing_1.mount)(react_1.default.createElement(BlankTrackingFlashList, tslib_1.__assign({}, props, { instance: flashListRef })));
    return {
        root: blankTrackingFlashList,
        instance: flashListRef.current,
    };
};
describe("useBlankAreaTracker Hook", function () {
    beforeEach(function () {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });
    it("ignores blank events for 500ms on mount and if content is not enough to fill the list", function () {
        var onCumulativeBlankAreaChange = jest.fn();
        var flashList = mountBlankTrackingFlashList({
            onCumulativeBlankAreaChange: onCumulativeBlankAreaChange,
        });
        flashList.instance.props.onBlankArea({
            blankArea: 100,
            offsetEnd: 100,
            offsetStart: 0,
        });
        flashList.instance.props.onBlankArea({
            blankArea: 100,
            offsetEnd: 100,
            offsetStart: 0,
        });
        jest.advanceTimersByTime(400);
        flashList.instance.props.onBlankArea({
            blankArea: 100,
            offsetEnd: 100,
            offsetStart: 0,
        });
        expect(onCumulativeBlankAreaChange).toHaveBeenCalledTimes(0);
        jest.advanceTimersByTime(100);
        flashList.instance.props.onBlankArea({
            blankArea: 100,
            offsetEnd: 100,
            offsetStart: 0,
        });
        expect(onCumulativeBlankAreaChange).toHaveBeenCalledTimes(1);
        onCumulativeBlankAreaChange.mockClear();
        flashList.root.setProps({ data: ["1"] });
        flashList.instance.props.onBlankArea({
            blankArea: 100,
            offsetEnd: 100,
            offsetStart: 0,
        });
        expect(onCumulativeBlankAreaChange).toHaveBeenCalledTimes(0);
        flashList.root.unmount();
    });
    it("keeps result object updated with correct values on unmount", function () {
        var resultObjectCopy;
        var onCumulativeBlankAreaChange = jest.fn(function (result) {
            if (!resultObjectCopy) {
                resultObjectCopy = result;
            }
        });
        var onCumulativeBlankAreaResult = jest.fn();
        var flashList = mountBlankTrackingFlashList({
            onCumulativeBlankAreaResult: onCumulativeBlankAreaResult,
            onCumulativeBlankAreaChange: onCumulativeBlankAreaChange,
            blankAreaTrackerConfig: { startDelayInMs: 300 },
        });
        flashList.instance.props.onBlankArea({
            blankArea: 100,
            offsetEnd: 100,
            offsetStart: 0,
        });
        jest.advanceTimersByTime(300);
        flashList.instance.props.onBlankArea({
            blankArea: 100,
            offsetEnd: 100,
            offsetStart: 0,
        });
        expect(resultObjectCopy.cumulativeBlankArea).toBe(100);
        expect(resultObjectCopy.maxBlankArea).toBe(100);
        flashList.instance.props.onBlankArea({
            blankArea: 200,
            offsetEnd: 200,
            offsetStart: 0,
        });
        flashList.instance.props.onBlankArea({
            blankArea: -200,
            offsetEnd: -200,
            offsetStart: 0,
        });
        expect(resultObjectCopy.cumulativeBlankArea).toBe(300);
        expect(resultObjectCopy.maxBlankArea).toBe(200);
        flashList.root.unmount();
        expect(onCumulativeBlankAreaResult).toHaveBeenCalledWith(resultObjectCopy);
    });
    it("can track negative values on demand", function () {
        var onCumulativeBlankAreaResult = jest.fn();
        var flashList = mountBlankTrackingFlashList({
            onCumulativeBlankAreaResult: onCumulativeBlankAreaResult,
            blankAreaTrackerConfig: { sumNegativeValues: true },
        });
        flashList.instance.props.onBlankArea({
            blankArea: -200,
            offsetEnd: -200,
            offsetStart: 0,
        });
        jest.advanceTimersByTime(500);
        flashList.instance.props.onBlankArea({
            blankArea: -200,
            offsetEnd: -200,
            offsetStart: 0,
        });
        flashList.instance.props.onBlankArea({
            blankArea: -200,
            offsetEnd: -200,
            offsetStart: 0,
        });
        flashList.root.unmount();
        expect(onCumulativeBlankAreaResult).toHaveBeenCalledWith({
            cumulativeBlankArea: -400,
            maxBlankArea: 0,
        });
    });
    it("only calls onCumulativeBlankAreaChange when values have a change", function () {
        var onCumulativeBlankAreaChange = jest.fn();
        var flashList = mountBlankTrackingFlashList({
            onCumulativeBlankAreaChange: onCumulativeBlankAreaChange,
        });
        flashList.instance.props.onBlankArea({
            blankArea: -200,
            offsetEnd: -200,
            offsetStart: 0,
        });
        jest.advanceTimersByTime(500);
        flashList.instance.props.onBlankArea({
            blankArea: -200,
            offsetEnd: -200,
            offsetStart: 0,
        });
        expect(onCumulativeBlankAreaChange).toHaveBeenCalledTimes(0);
        flashList.instance.props.onBlankArea({
            blankArea: -100,
            offsetEnd: -100,
            offsetStart: 0,
        });
        expect(onCumulativeBlankAreaChange).toHaveBeenCalledTimes(0);
        flashList.instance.props.onBlankArea({
            blankArea: 100,
            offsetEnd: 100,
            offsetStart: 0,
        });
        expect(onCumulativeBlankAreaChange).toHaveBeenCalledTimes(1);
        flashList.root.unmount();
    });
});
//# sourceMappingURL=useBlankAreaTracker.test.js.map