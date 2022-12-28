"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var recyclerlistview_1 = require("recyclerlistview");
var AverageWindow_1 = require("./utils/AverageWindow");
var ContentContainerUtils_1 = require("./utils/ContentContainerUtils");
var GridLayoutProviderWithProps = /** @class */ (function (_super) {
    tslib_1.__extends(GridLayoutProviderWithProps, _super);
    function GridLayoutProviderWithProps(maxSpan, getLayoutType, getSpan, getHeightOrWidth, props, acceptableRelayoutDelta) {
        var _this = this;
        var _a;
        _this = _super.call(this, maxSpan, function (i) {
            return getLayoutType(i, _this.props, _this.getCleanLayoutObj());
        }, function (i) {
            return getSpan(i, _this.props, _this.getCleanLayoutObj());
        }, function (i) {
            var _a;
            return (
            // Using average item size if no override has been provided by the developer
            (_a = getHeightOrWidth(i, _this.props, _this.getCleanLayoutObj())) !== null && _a !== void 0 ? _a : _this.averageItemSize);
        }, acceptableRelayoutDelta) || this;
        _this.layoutObject = { span: undefined, size: undefined };
        _this.renderWindowInsets = { width: 0, height: 0 };
        _this._hasExpired = false;
        _this.defaultEstimatedItemSize = 100;
        _this.props = props;
        _this.averageWindow = new AverageWindow_1.AverageWindow(1, (_a = props.estimatedItemSize) !== null && _a !== void 0 ? _a : _this.defaultEstimatedItemSize);
        _this.renderWindowInsets = _this.getAdjustedRenderWindowSize(_this.renderWindowInsets);
        return _this;
    }
    GridLayoutProviderWithProps.prototype.updateProps = function (props) {
        this._hasExpired = this.props.numColumns !== props.numColumns;
        var newInsetValues = (0, ContentContainerUtils_1.applyContentContainerInsetForLayoutManager)({
            height: 0,
            width: 0,
        }, props.contentContainerStyle, Boolean(props.horizontal));
        this._hasExpired =
            this._hasExpired ||
                newInsetValues.height !== this.renderWindowInsets.height ||
                newInsetValues.width !== this.renderWindowInsets.width;
        this.renderWindowInsets = newInsetValues;
        this.props = props;
        return this;
    };
    Object.defineProperty(GridLayoutProviderWithProps.prototype, "hasExpired", {
        /**
         * This methods returns true if the layout provider has expired and needs to be recreated.
         * This can happen if the number of columns has changed or the render window size has changed in a way that cannot be handled by the layout provider internally.
         */
        get: function () {
            return this._hasExpired;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Calling this method will help the layout provider track average item sizes on its own
     * Overriding layout manager can help achieve the same thing without relying on this method being called however, it will make implementation very complex for a simple use case
     * @param index Index of the item being reported
     */
    GridLayoutProviderWithProps.prototype.reportItemLayout = function (index) {
        var _a;
        var layout = (_a = this.getLayoutManager()) === null || _a === void 0 ? void 0 : _a.getLayouts()[index];
        if (layout) {
            // For the same index we can now return different estimates because average is updated in realtime
            // Marking the layout as overridden will help layout manager avoid using the average after initial measurement
            layout.isOverridden = true;
            this.averageWindow.addValue(this.props.horizontal ? layout.width : layout.height);
        }
    };
    Object.defineProperty(GridLayoutProviderWithProps.prototype, "averageItemSize", {
        get: function () {
            return this.averageWindow.currentValue;
        },
        enumerable: false,
        configurable: true
    });
    GridLayoutProviderWithProps.prototype.newLayoutManager = function (renderWindowSize, isHorizontal, cachedLayouts) {
        var _a;
        // Average window is updated whenever a new layout manager is created. This is because old values are not relevant anymore.
        var estimatedItemCount = Math.max(3, Math.round((this.props.horizontal
            ? renderWindowSize.width
            : renderWindowSize.height) /
            ((_a = this.props.estimatedItemSize) !== null && _a !== void 0 ? _a : this.defaultEstimatedItemSize)));
        this.averageWindow = new AverageWindow_1.AverageWindow(2 * (this.props.numColumns || 1) * estimatedItemCount, this.averageWindow.currentValue);
        var newLayoutManager = _super.prototype.newLayoutManager.call(this, this.getAdjustedRenderWindowSize(renderWindowSize), isHorizontal, cachedLayouts);
        if (cachedLayouts) {
            this.updateCachedDimensions(cachedLayouts, newLayoutManager);
        }
        return newLayoutManager;
    };
    GridLayoutProviderWithProps.prototype.updateCachedDimensions = function (cachedLayouts, layoutManager) {
        var layoutCount = cachedLayouts.length;
        for (var i = 0; i < layoutCount; i++) {
            cachedLayouts[i] = tslib_1.__assign(tslib_1.__assign({}, cachedLayouts[i]), layoutManager.getStyleOverridesForIndex(i));
        }
    };
    GridLayoutProviderWithProps.prototype.getCleanLayoutObj = function () {
        this.layoutObject.size = undefined;
        this.layoutObject.span = undefined;
        return this.layoutObject;
    };
    GridLayoutProviderWithProps.prototype.getAdjustedRenderWindowSize = function (renderWindowSize) {
        return (0, ContentContainerUtils_1.applyContentContainerInsetForLayoutManager)(tslib_1.__assign({}, renderWindowSize), this.props.contentContainerStyle, Boolean(this.props.horizontal));
    };
    return GridLayoutProviderWithProps;
}(recyclerlistview_1.GridLayoutProvider));
exports.default = GridLayoutProviderWithProps;
//# sourceMappingURL=GridLayoutProviderWithProps.js.map