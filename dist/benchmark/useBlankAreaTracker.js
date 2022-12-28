"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBlankAreaTracker = void 0;
var react_1 = require("react");
/**
 * Can be used to track visible blank area in production
 * @param flashListRef Ref to the FlashList component
 * @param onBlankAreaChange This event handler will be called when the blank area changes
 * @param config additional configuration for the blank area tracker
 * @returns blankAreaTrackerResult - maxBlankArea, cumulativeBlankArea this object is mutated and kept up to date. Also returns a callback that needs to be forwarded to FlashList.
 */
function useBlankAreaTracker(flashListRef, onBlankAreaChange, config) {
    var _a;
    var startDelay = (_a = config === null || config === void 0 ? void 0 : config.startDelayInMs) !== null && _a !== void 0 ? _a : 1000;
    var blankAreaResult = (0, react_1.useRef)({
        maxBlankArea: 0,
        cumulativeBlankArea: 0,
    }).current;
    var waitOperations = (0, react_1.useRef)({ inProgress: false, complete: false }).current;
    var onBlankAreaChangeRef = (0, react_1.useRef)(onBlankAreaChange);
    onBlankAreaChangeRef.current = onBlankAreaChange;
    var blankAreaTracker = (0, react_1.useCallback)(function (event) {
        var _a, _b;
        // we're ignoring some of the events that will be fired on list load
        // initial events are fired on mount and thus, this won't lead to missing events during scroll
        if (!waitOperations.complete && startDelay > 0) {
            if (!waitOperations.inProgress) {
                waitOperations.inProgress = true;
                setTimeout(function () {
                    waitOperations.complete = true;
                }, startDelay);
            }
            return;
        }
        var rlv = (_a = flashListRef.current) === null || _a === void 0 ? void 0 : _a.recyclerlistview_unsafe;
        var horizontal = Boolean((_b = flashListRef.current) === null || _b === void 0 ? void 0 : _b.props.horizontal);
        if (rlv) {
            processBlankAreaChange(rlv, horizontal, blankAreaResult, event, onBlankAreaChangeRef.current, config);
        }
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [flashListRef]);
    return [blankAreaResult, blankAreaTracker];
}
exports.useBlankAreaTracker = useBlankAreaTracker;
function processBlankAreaChange(rlv, horizontal, blankAreaResult, event, onBlankAreaChange, config) {
    var listSize = horizontal
        ? rlv.getRenderedSize().width
        : rlv.getRenderedSize().height;
    var contentSize = horizontal
        ? rlv.getContentDimension().width
        : rlv.getContentDimension().height;
    // ignores blank events when there isn't enough content to fill the list
    if (contentSize > listSize) {
        var lastMaxBlankArea = blankAreaResult.maxBlankArea;
        var lastCumulativeBlankArea = blankAreaResult.cumulativeBlankArea;
        blankAreaResult.maxBlankArea = Math.max(blankAreaResult.maxBlankArea, event.blankArea, 0);
        blankAreaResult.cumulativeBlankArea += (config === null || config === void 0 ? void 0 : config.sumNegativeValues)
            ? event.blankArea
            : Math.max(event.blankArea, 0);
        if (lastCumulativeBlankArea !== blankAreaResult.cumulativeBlankArea ||
            lastMaxBlankArea !== blankAreaResult.maxBlankArea) {
            onBlankAreaChange === null || onBlankAreaChange === void 0 ? void 0 : onBlankAreaChange(blankAreaResult);
        }
    }
}
//# sourceMappingURL=useBlankAreaTracker.js.map