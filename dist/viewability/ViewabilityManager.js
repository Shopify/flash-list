"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ViewabilityHelper_1 = tslib_1.__importDefault(require("./ViewabilityHelper"));
/**
 * Manager for viewability tracking. It holds multiple viewability callback pairs and keeps them updated.
 */
var ViewabilityManager = /** @class */ (function () {
    function ViewabilityManager(flashListRef) {
        var _this = this;
        var _a;
        this.viewabilityHelpers = [];
        this.hasInteracted = false;
        this.dispose = function () {
            _this.viewabilityHelpers.forEach(function (viewabilityHelper) {
                return viewabilityHelper.dispose();
            });
        };
        this.onVisibleIndicesChanged = function (all) {
            _this.updateViewableItems(all);
        };
        this.recordInteraction = function () {
            if (_this.hasInteracted) {
                return;
            }
            _this.hasInteracted = true;
            _this.viewabilityHelpers.forEach(function (viewabilityHelper) {
                viewabilityHelper.hasInteracted = true;
            });
            _this.updateViewableItems();
        };
        this.updateViewableItems = function (newViewableIndices) {
            var _a, _b, _c, _d;
            var listSize = (_b = (_a = _this.flashListRef.recyclerlistview_unsafe) === null || _a === void 0 ? void 0 : _a.getRenderedSize()) !== null && _b !== void 0 ? _b : _this.flashListRef.props.estimatedListSize;
            if (listSize === undefined || !_this.shouldListenToVisibleIndices) {
                return;
            }
            var scrollOffset = ((_d = (_c = _this.flashListRef.recyclerlistview_unsafe) === null || _c === void 0 ? void 0 : _c.getCurrentScrollOffset()) !== null && _d !== void 0 ? _d : 0) - _this.flashListRef.firstItemOffset;
            _this.viewabilityHelpers.forEach(function (viewabilityHelper) {
                var _a;
                viewabilityHelper.updateViewableItems((_a = _this.flashListRef.props.horizontal) !== null && _a !== void 0 ? _a : false, scrollOffset, listSize, function (index) { var _a; return (_a = _this.flashListRef.recyclerlistview_unsafe) === null || _a === void 0 ? void 0 : _a.getLayout(index); }, newViewableIndices);
            });
        };
        /**
         * Creates a new `ViewabilityHelper` instance with `onViewableItemsChanged` callback and `ViewabilityConfig`
         * @returns `ViewabilityHelper` instance
         */
        this.createViewabilityHelper = function (viewabilityConfig, onViewableItemsChanged) {
            var mapViewToken = function (index, isViewable) {
                var _a;
                var item = (_a = _this.flashListRef.props.data) === null || _a === void 0 ? void 0 : _a[index];
                var key = item === undefined || _this.flashListRef.props.keyExtractor === undefined
                    ? index.toString()
                    : _this.flashListRef.props.keyExtractor(item, index);
                return {
                    index: index,
                    isViewable: isViewable,
                    item: item,
                    key: key,
                    timestamp: Date.now(),
                };
            };
            return new ViewabilityHelper_1.default(viewabilityConfig, function (indices, newlyVisibleIndices, newlyNonvisibleIndices) {
                onViewableItemsChanged === null || onViewableItemsChanged === void 0 ? void 0 : onViewableItemsChanged({
                    viewableItems: indices.map(function (index) { return mapViewToken(index, true); }),
                    changed: tslib_1.__spreadArray(tslib_1.__spreadArray([], tslib_1.__read(newlyVisibleIndices.map(function (index) { return mapViewToken(index, true); })), false), tslib_1.__read(newlyNonvisibleIndices.map(function (index) {
                        return mapViewToken(index, false);
                    })), false),
                });
            });
        };
        this.flashListRef = flashListRef;
        if (flashListRef.props.onViewableItemsChanged !== null &&
            flashListRef.props.onViewableItemsChanged !== undefined) {
            this.viewabilityHelpers.push(this.createViewabilityHelper(flashListRef.props.viewabilityConfig, flashListRef.props.onViewableItemsChanged));
        }
        ((_a = flashListRef.props.viewabilityConfigCallbackPairs) !== null && _a !== void 0 ? _a : []).forEach(function (pair) {
            _this.viewabilityHelpers.push(_this.createViewabilityHelper(pair.viewabilityConfig, pair.onViewableItemsChanged));
        });
    }
    Object.defineProperty(ViewabilityManager.prototype, "shouldListenToVisibleIndices", {
        /**
         * @returns true if the viewability manager has any viewability callback pairs registered.
         */
        get: function () {
            return this.viewabilityHelpers.length > 0;
        },
        enumerable: false,
        configurable: true
    });
    return ViewabilityManager;
}());
exports.default = ViewabilityManager;
//# sourceMappingURL=ViewabilityManager.js.map