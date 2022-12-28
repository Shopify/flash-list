"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var CustomError_1 = tslib_1.__importDefault(require("../errors/CustomError"));
var ExceptionList_1 = tslib_1.__importDefault(require("../errors/ExceptionList"));
/**
 * Helper class for computing viewable items based on the passed `viewabilityConfig`.
 * Note methods in this class will be invoked on every scroll and should be optimized for performance.
 */
var ViewabilityHelper = /** @class */ (function () {
    function ViewabilityHelper(viewabilityConfig, viewableIndicesChanged) {
        /**
         * Viewable indices regardless of the viewability config
         */
        this.possiblyViewableIndices = [];
        this.hasInteracted = false;
        this.viewableIndices = [];
        this.lastReportedViewableIndices = [];
        this.timers = new Set();
        this.viewabilityConfig = viewabilityConfig;
        this.viewableIndicesChanged = viewableIndicesChanged;
    }
    ViewabilityHelper.prototype.dispose = function () {
        // Clean up on dismount
        this.timers.forEach(clearTimeout);
    };
    ViewabilityHelper.prototype.updateViewableItems = function (horizontal, scrollOffset, listSize, getLayout, viewableIndices) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (viewableIndices !== undefined) {
            this.possiblyViewableIndices = viewableIndices;
        }
        if (((_a = this.viewabilityConfig) === null || _a === void 0 ? void 0 : _a.itemVisiblePercentThreshold) !== null &&
            ((_b = this.viewabilityConfig) === null || _b === void 0 ? void 0 : _b.itemVisiblePercentThreshold) !== undefined &&
            ((_c = this.viewabilityConfig) === null || _c === void 0 ? void 0 : _c.viewAreaCoveragePercentThreshold) !== null &&
            ((_d = this.viewabilityConfig) === null || _d === void 0 ? void 0 : _d.viewAreaCoveragePercentThreshold) !== undefined) {
            throw new CustomError_1.default(ExceptionList_1.default.multipleViewabilityThresholdTypesNotSupported);
        }
        if (((_f = (_e = this.viewabilityConfig) === null || _e === void 0 ? void 0 : _e.waitForInteraction) !== null && _f !== void 0 ? _f : false) &&
            !this.hasInteracted) {
            return;
        }
        var newViewableIndices = this.possiblyViewableIndices.filter(function (index) {
            var _a, _b;
            return _this.isItemViewable(index, horizontal, scrollOffset, listSize, (_a = _this.viewabilityConfig) === null || _a === void 0 ? void 0 : _a.viewAreaCoveragePercentThreshold, (_b = _this.viewabilityConfig) === null || _b === void 0 ? void 0 : _b.itemVisiblePercentThreshold, getLayout);
        });
        this.viewableIndices = newViewableIndices;
        var minimumViewTime = (_h = (_g = this.viewabilityConfig) === null || _g === void 0 ? void 0 : _g.minimumViewTime) !== null && _h !== void 0 ? _h : 250;
        // Setting default to 250. Default of 0 can impact performance when user scrolls fast.
        if (minimumViewTime > 0) {
            var timeoutId_1 = setTimeout(function () {
                _this.timers.delete(timeoutId_1);
                _this.checkViewableIndicesChanges(newViewableIndices);
                _this.timers.add(timeoutId_1);
            }, minimumViewTime);
        }
        else {
            this.checkViewableIndicesChanges(newViewableIndices);
        }
    };
    ViewabilityHelper.prototype.checkViewableIndicesChanges = function (newViewableIndices) {
        var _this = this;
        // Check if all viewable indices are still available (applicable if minimumViewTime > 0)
        var currentlyNewViewableIndices = newViewableIndices.filter(function (index) {
            return _this.viewableIndices.includes(index);
        });
        var newlyVisibleItems = currentlyNewViewableIndices.filter(function (index) { return !_this.lastReportedViewableIndices.includes(index); });
        var newlyNonvisibleItems = this.lastReportedViewableIndices.filter(function (index) { return !currentlyNewViewableIndices.includes(index); });
        if (newlyVisibleItems.length > 0 || newlyNonvisibleItems.length > 0) {
            this.lastReportedViewableIndices = currentlyNewViewableIndices;
            this.viewableIndicesChanged(currentlyNewViewableIndices, newlyVisibleItems, newlyNonvisibleItems);
        }
    };
    ViewabilityHelper.prototype.isItemViewable = function (index, horizontal, scrollOffset, listSize, viewAreaCoveragePercentThreshold, itemVisiblePercentThreshold, getLayout) {
        var itemLayout = getLayout(index);
        if (itemLayout === undefined) {
            return false;
        }
        var itemTop = (horizontal ? itemLayout.x : itemLayout.y) - scrollOffset;
        var itemSize = horizontal ? itemLayout.width : itemLayout.height;
        var listMainSize = horizontal ? listSize.width : listSize.height;
        var pixelsVisible = Math.min(itemTop + itemSize, listMainSize) - Math.max(itemTop, 0);
        // Always consider item fully viewable if it is fully visible, regardless of the `viewAreaCoveragePercentThreshold`
        if (pixelsVisible === itemSize) {
            return true;
        }
        // Skip checking item if it's not visible at all
        if (pixelsVisible === 0) {
            return false;
        }
        var viewAreaMode = viewAreaCoveragePercentThreshold !== null &&
            viewAreaCoveragePercentThreshold !== undefined;
        var percent = viewAreaMode
            ? pixelsVisible / listMainSize
            : pixelsVisible / itemSize;
        var viewableAreaPercentThreshold = viewAreaMode
            ? viewAreaCoveragePercentThreshold * 0.01
            : (itemVisiblePercentThreshold !== null && itemVisiblePercentThreshold !== void 0 ? itemVisiblePercentThreshold : 0) * 0.01;
        return percent >= viewableAreaPercentThreshold;
    };
    return ViewabilityHelper;
}());
exports.default = ViewabilityHelper;
//# sourceMappingURL=ViewabilityHelper.js.map