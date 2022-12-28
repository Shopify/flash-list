"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFormattedString = exports.useBenchmark = void 0;
var tslib_1 = require("tslib");
var react_1 = require("react");
var AutoScrollHelper_1 = require("./AutoScrollHelper");
var JSFPSMonitor_1 = require("./JSFPSMonitor");
var roundToDecimalPlaces_1 = require("./roundToDecimalPlaces");
var useBlankAreaTracker_1 = require("./useBlankAreaTracker");
/**
 * Runs the benchmark on FlashList.
 * Response object has a formatted string that can be printed to the console or shown as an alert.
 * Result is posted to the callback method passed to the hook.
 */
function useBenchmark(flashListRef, callback, params) {
    var _this = this;
    if (params === void 0) { params = {}; }
    var _a = tslib_1.__read((0, useBlankAreaTracker_1.useBlankAreaTracker)(flashListRef, undefined, { sumNegativeValues: params.sumNegativeBlankAreaValues, startDelayInMs: 0 }), 2), blankAreaResult = _a[0], blankAreaTracker = _a[1];
    (0, react_1.useEffect)(function () {
        var _a;
        var cancellable = new AutoScrollHelper_1.Cancellable();
        var suggestions = [];
        if (flashListRef.current) {
            if (!(Number((_a = flashListRef.current.props.data) === null || _a === void 0 ? void 0 : _a.length) > 0)) {
                throw new Error("Data is empty, cannot run benchmark");
            }
        }
        var cancelTimeout = setTimeout(function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var jsFPSMonitor, i, jsProfilerResponse, result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        jsFPSMonitor = new JSFPSMonitor_1.JSFPSMonitor();
                        jsFPSMonitor.startTracking();
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < (params.repeatCount || 1))) return [3 /*break*/, 4];
                        return [4 /*yield*/, runScrollBenchmark(flashListRef, cancellable, params.speedMultiplier || 1)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        jsProfilerResponse = jsFPSMonitor.stopAndGetData();
                        if (jsProfilerResponse.averageFPS < 35) {
                            suggestions.push("Your average JS FPS is low. This can indicate that your components are doing too much work. Try to optimize your components and reduce re-renders if any");
                        }
                        computeSuggestions(flashListRef, suggestions);
                        result = generateResult(jsProfilerResponse, blankAreaResult, suggestions, cancellable);
                        if (!cancellable.isCancelled()) {
                            result.formattedString = getFormattedString(result);
                        }
                        callback(result);
                        return [2 /*return*/];
                }
            });
        }); }, params.startDelayInMs || 3000);
        return function () {
            clearTimeout(cancelTimeout);
            cancellable.cancel();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return [blankAreaTracker];
}
exports.useBenchmark = useBenchmark;
function getFormattedString(res) {
    var _a, _b, _c, _d, _e;
    return ("Results:\n\n" +
        "JS FPS: Avg: ".concat((_a = res.js) === null || _a === void 0 ? void 0 : _a.averageFPS, " | Min: ").concat((_b = res.js) === null || _b === void 0 ? void 0 : _b.minFPS, " | Max: ").concat((_c = res.js) === null || _c === void 0 ? void 0 : _c.maxFPS, "\n\n") +
        "".concat(res.blankArea
            ? "Blank Area: Max: ".concat((_d = res.blankArea) === null || _d === void 0 ? void 0 : _d.maxBlankArea, " Cumulative: ").concat((_e = res.blankArea) === null || _e === void 0 ? void 0 : _e.cumulativeBlankArea, "\n\n")
            : "") +
        "".concat(res.suggestions.length > 0
            ? "Suggestions:\n\n".concat(res.suggestions
                .map(function (value, index) { return "".concat(index + 1, ". ").concat(value); })
                .join("\n"))
            : ""));
}
exports.getFormattedString = getFormattedString;
function generateResult(jsProfilerResponse, blankAreaResult, suggestions, cancellable) {
    return {
        js: jsProfilerResponse,
        blankArea: blankAreaResult.maxBlankArea >= 0
            ? {
                maxBlankArea: (0, roundToDecimalPlaces_1.roundToDecimalPlaces)(blankAreaResult.maxBlankArea, 0),
                cumulativeBlankArea: (0, roundToDecimalPlaces_1.roundToDecimalPlaces)(blankAreaResult.cumulativeBlankArea, 0),
            }
            : undefined,
        suggestions: suggestions,
        interrupted: cancellable.isCancelled(),
    };
}
/**
 * Scrolls to the end of the list and then back to the top
 */
function runScrollBenchmark(flashListRef, cancellable, scrollSpeedMultiplier) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var horizontal_1, rlv, rlvSize, rlvContentSize, fromX, fromY, toX, toY, scrollNow;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!flashListRef.current) return [3 /*break*/, 3];
                    horizontal_1 = flashListRef.current.props.horizontal;
                    rlv = flashListRef.current.recyclerlistview_unsafe;
                    if (!rlv) return [3 /*break*/, 3];
                    rlvSize = rlv.getRenderedSize();
                    rlvContentSize = rlv.getContentDimension();
                    fromX = 0;
                    fromY = 0;
                    toX = rlvContentSize.width - rlvSize.width;
                    toY = rlvContentSize.height - rlvSize.height;
                    scrollNow = function (x, y) {
                        var _a;
                        (_a = flashListRef.current) === null || _a === void 0 ? void 0 : _a.scrollToOffset({
                            offset: horizontal_1 ? x : y,
                            animated: false,
                        });
                    };
                    return [4 /*yield*/, (0, AutoScrollHelper_1.autoScroll)(scrollNow, fromX, fromY, toX, toY, scrollSpeedMultiplier, cancellable)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, AutoScrollHelper_1.autoScroll)(scrollNow, toX, toY, fromX, fromY, scrollSpeedMultiplier, cancellable)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function computeSuggestions(flashListRef, suggestions) {
    var _a;
    if (flashListRef.current) {
        if (flashListRef.current.props.data.length < 200) {
            suggestions.push("Data count is low. Try to increase it to a large number (e.g 200) using the 'useDataMultiplier' hook.");
        }
        var distanceFromWindow = (0, roundToDecimalPlaces_1.roundToDecimalPlaces)(flashListRef.current.firstItemOffset, 0);
        if ((flashListRef.current.props.estimatedFirstItemOffset || 0) !==
            distanceFromWindow) {
            suggestions.push("estimatedFirstItemOffset can be set to ".concat(distanceFromWindow));
        }
        var rlv_1 = flashListRef.current.recyclerlistview_unsafe;
        var horizontal_2 = flashListRef.current.props.horizontal;
        if (rlv_1) {
            var sizeArray = rlv_1.props.dataProvider
                .getAllData()
                .map(function (_, index) {
                var _a, _b, _c, _d;
                return horizontal_2
                    ? ((_b = (_a = rlv_1.getLayout) === null || _a === void 0 ? void 0 : _a.call(rlv_1, index)) === null || _b === void 0 ? void 0 : _b.width) || 0
                    : ((_d = (_c = rlv_1.getLayout) === null || _c === void 0 ? void 0 : _c.call(rlv_1, index)) === null || _d === void 0 ? void 0 : _d.height) || 0;
            });
            var averageSize = Math.round(sizeArray.reduce(function (prev, current) { return prev + current; }, 0) /
                sizeArray.length);
            if (Math.abs(averageSize -
                ((_a = flashListRef.current.props.estimatedItemSize) !== null && _a !== void 0 ? _a : flashListRef.current.state.layoutProvider
                    .defaultEstimatedItemSize)) > 5) {
                suggestions.push("estimatedItemSize can be set to ".concat(averageSize));
            }
        }
    }
}
//# sourceMappingURL=useBenchmark.js.map