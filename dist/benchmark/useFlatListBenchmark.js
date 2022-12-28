"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFlatListBenchmark = void 0;
var tslib_1 = require("tslib");
var react_1 = require("react");
var AutoScrollHelper_1 = require("./AutoScrollHelper");
var JSFPSMonitor_1 = require("./JSFPSMonitor");
var useBenchmark_1 = require("./useBenchmark");
/**
 * Runs the benchmark on FlatList and calls the callback method with the result.
 * Target offset is mandatory in params.
 * It's recommended to remove pagination while running the benchmark. Removing the onEndReached callback is the easiest way to do that.
 */
function useFlatListBenchmark(flatListRef, callback, params) {
    var _this = this;
    (0, react_1.useEffect)(function () {
        var _a;
        var cancellable = new AutoScrollHelper_1.Cancellable();
        if (flatListRef.current) {
            if (!(Number((_a = flatListRef.current.props.data) === null || _a === void 0 ? void 0 : _a.length) > 0)) {
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
                        return [4 /*yield*/, runScrollBenchmark(flatListRef, params.targetOffset, cancellable, params.speedMultiplier || 1)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        jsProfilerResponse = jsFPSMonitor.stopAndGetData();
                        result = {
                            js: jsProfilerResponse,
                            suggestions: [],
                            interrupted: cancellable.isCancelled(),
                        };
                        if (!cancellable.isCancelled()) {
                            result.formattedString = (0, useBenchmark_1.getFormattedString)(result);
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
    return [];
}
exports.useFlatListBenchmark = useFlatListBenchmark;
/**
 * Scrolls to the target offset and then back to 0
 */
function runScrollBenchmark(flatListRef, targetOffset, cancellable, scrollSpeedMultiplier) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var horizontal_1, fromX, fromY, toX, toY, scrollNow;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!flatListRef.current) return [3 /*break*/, 3];
                    horizontal_1 = flatListRef.current.props.horizontal;
                    fromX = 0;
                    fromY = 0;
                    toX = horizontal_1 ? targetOffset : 0;
                    toY = horizontal_1 ? 0 : targetOffset;
                    scrollNow = function (x, y) {
                        var _a;
                        (_a = flatListRef.current) === null || _a === void 0 ? void 0 : _a.scrollToOffset({
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
//# sourceMappingURL=useFlatListBenchmark.js.map