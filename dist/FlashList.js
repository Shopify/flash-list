"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importDefault(require("react"));
var react_native_1 = require("react-native");
var recyclerlistview_1 = require("recyclerlistview");
var sticky_1 = tslib_1.__importDefault(require("recyclerlistview/sticky"));
var AutoLayoutView_1 = tslib_1.__importDefault(require("./native/auto-layout/AutoLayoutView"));
var CellContainer_1 = tslib_1.__importDefault(require("./native/cell-container/CellContainer"));
var PureComponentWrapper_1 = require("./PureComponentWrapper");
var GridLayoutProviderWithProps_1 = tslib_1.__importDefault(require("./GridLayoutProviderWithProps"));
var CustomError_1 = tslib_1.__importDefault(require("./errors/CustomError"));
var ExceptionList_1 = tslib_1.__importDefault(require("./errors/ExceptionList"));
var Warnings_1 = tslib_1.__importDefault(require("./errors/Warnings"));
var ViewabilityManager_1 = tslib_1.__importDefault(require("./viewability/ViewabilityManager"));
var FlashListProps_1 = require("./FlashListProps");
var PlatformHelper_1 = require("./native/config/PlatformHelper");
var ContentContainerUtils_1 = require("./utils/ContentContainerUtils");
var StickyHeaderContainer = sticky_1.default;
var FlashList = /** @class */ (function (_super) {
    tslib_1.__extends(FlashList, _super);
    function FlashList(props) {
        var _this = this;
        var _a;
        _this = _super.call(this, props) || this;
        _this.listFixedDimensionSize = 0;
        _this.transformStyle = { transform: [{ scaleY: -1 }] };
        _this.transformStyleHorizontal = { transform: [{ scaleX: -1 }] };
        _this.distanceFromWindow = 0;
        _this.contentStyle = {
            paddingBottom: 0,
            paddingTop: 0,
            paddingLeft: 0,
            paddingRight: 0,
        };
        _this.loadStartTime = 0;
        _this.isListLoaded = false;
        _this.windowCorrectionConfig = {
            value: {
                windowShift: 0,
                startCorrection: 0,
                endCorrection: 0,
            },
            applyToItemScroll: true,
            applyToInitialOffset: true,
        };
        _this.isEmptyList = false;
        _this.onEndReached = function () {
            var _a, _b;
            (_b = (_a = _this.props).onEndReached) === null || _b === void 0 ? void 0 : _b.call(_a);
        };
        _this.getRefreshControl = function () {
            if (_this.props.onRefresh) {
                return (react_1.default.createElement(react_native_1.RefreshControl, { refreshing: Boolean(_this.props.refreshing), progressViewOffset: _this.props.progressViewOffset, onRefresh: _this.props.onRefresh }));
            }
        };
        _this.onScrollBeginDrag = function (event) {
            var _a, _b;
            _this.recordInteraction();
            (_b = (_a = _this.props).onScrollBeginDrag) === null || _b === void 0 ? void 0 : _b.call(_a, event);
        };
        _this.onScroll = function (event) {
            var _a, _b;
            _this.recordInteraction();
            _this.viewabilityManager.updateViewableItems();
            (_b = (_a = _this.props).onScroll) === null || _b === void 0 ? void 0 : _b.call(_a, event);
        };
        _this.handleSizeChange = function (event) {
            var _a;
            _this.validateListSize(event);
            var newSize = _this.props.horizontal
                ? event.nativeEvent.layout.height
                : event.nativeEvent.layout.width;
            var oldSize = _this.listFixedDimensionSize;
            _this.listFixedDimensionSize = newSize;
            // >0 check is to avoid rerender on mount where it would be redundant
            if (oldSize > 0 && oldSize !== newSize) {
                (_a = _this.rlvRef) === null || _a === void 0 ? void 0 : _a.forceRerender();
            }
            if (_this.props.onLayout) {
                _this.props.onLayout(event);
            }
        };
        _this.container = function (props, children) {
            _this.clearPostLoadTimeout();
            return (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(PureComponentWrapper_1.PureComponentWrapper, { enabled: _this.isListLoaded || children.length > 0 || _this.isEmptyList, contentStyle: _this.props.contentContainerStyle, horizontal: _this.props.horizontal, header: _this.props.ListHeaderComponent, extraData: _this.state.extraData, headerStyle: _this.props.ListHeaderComponentStyle, inverted: _this.props.inverted, renderer: _this.header }),
                react_1.default.createElement(AutoLayoutView_1.default, tslib_1.__assign({}, props, { onBlankAreaEvent: _this.props.onBlankArea, onLayout: _this.updateDistanceFromWindow, disableAutoLayout: _this.props.disableAutoLayout }), children),
                _this.isEmptyList
                    ? _this.getValidComponent(_this.props.ListEmptyComponent)
                    : null,
                react_1.default.createElement(PureComponentWrapper_1.PureComponentWrapper, { enabled: _this.isListLoaded || children.length > 0 || _this.isEmptyList, contentStyle: _this.props.contentContainerStyle, horizontal: _this.props.horizontal, header: _this.props.ListFooterComponent, extraData: _this.state.extraData, headerStyle: _this.props.ListFooterComponentStyle, inverted: _this.props.inverted, renderer: _this.footer }),
                _this.getComponentForHeightMeasurement()));
        };
        _this.itemContainer = function (props, parentProps) {
            var _a;
            var CellRendererComponent = (_a = _this.props.CellRendererComponent) !== null && _a !== void 0 ? _a : CellContainer_1.default;
            return (react_1.default.createElement(CellRendererComponent, tslib_1.__assign({}, props, { style: tslib_1.__assign(tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({}, props.style), { flexDirection: _this.props.horizontal ? "row" : "column", alignItems: "stretch" }), _this.getTransform()), (0, PlatformHelper_1.getCellContainerPlatformStyles)(_this.props.inverted, parentProps)), index: parentProps.index }),
                react_1.default.createElement(PureComponentWrapper_1.PureComponentWrapper, { extendedState: parentProps.extendedState, internalSnapshot: parentProps.internalSnapshot, data: parentProps.data, arg: parentProps.index, renderer: _this.getCellContainerChild })));
        };
        _this.updateDistanceFromWindow = function (event) {
            var newDistanceFromWindow = _this.props.horizontal
                ? event.nativeEvent.layout.x
                : event.nativeEvent.layout.y;
            if (_this.distanceFromWindow !== newDistanceFromWindow) {
                _this.distanceFromWindow = newDistanceFromWindow;
                _this.windowCorrectionConfig.value.windowShift = -_this.distanceFromWindow;
                _this.viewabilityManager.updateViewableItems();
            }
        };
        _this.separator = function (index) {
            // Make sure we have data and don't read out of bounds
            if (_this.props.data === null ||
                _this.props.data === undefined ||
                index + 1 >= _this.props.data.length) {
                return null;
            }
            var leadingItem = _this.props.data[index];
            var trailingItem = _this.props.data[index + 1];
            var props = {
                leadingItem: leadingItem,
                trailingItem: trailingItem,
                // TODO: Missing sections as we don't have this feature implemented yet. Implement section, leadingSection and trailingSection.
                // https://github.com/facebook/react-native/blob/8bd3edec88148d0ab1f225d2119435681fbbba33/Libraries/Lists/VirtualizedSectionList.js#L285-L294
            };
            var Separator = _this.props.ItemSeparatorComponent;
            return Separator && react_1.default.createElement(Separator, tslib_1.__assign({}, props));
        };
        _this.header = function () {
            return (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(react_native_1.View, { style: {
                        paddingTop: _this.contentStyle.paddingTop,
                        paddingLeft: _this.contentStyle.paddingLeft,
                    } }),
                react_1.default.createElement(react_native_1.View, { style: [_this.props.ListHeaderComponentStyle, _this.getTransform()] }, _this.getValidComponent(_this.props.ListHeaderComponent))));
        };
        _this.footer = function () {
            var _a;
            /** The web version of CellContainer uses a div directly which doesn't compose styles the way a View does.
             * We will skip using CellContainer on web to avoid this issue. `getFooterContainer` on web will
             * return a View. */
            var FooterContainer = (_a = (0, PlatformHelper_1.getFooterContainer)()) !== null && _a !== void 0 ? _a : CellContainer_1.default;
            return (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(FooterContainer, { index: -1, style: [_this.props.ListFooterComponentStyle, _this.getTransform()] }, _this.getValidComponent(_this.props.ListFooterComponent)),
                react_1.default.createElement(react_native_1.View, { style: {
                        paddingBottom: _this.contentStyle.paddingBottom,
                        paddingRight: _this.contentStyle.paddingRight,
                    } })));
        };
        _this.getComponentForHeightMeasurement = function () {
            return _this.props.horizontal &&
                !_this.props.disableHorizontalListHeightMeasurement &&
                !_this.isListLoaded &&
                _this.state.dataProvider.getSize() > 0 ? (react_1.default.createElement(react_native_1.View, { style: { opacity: 0 }, pointerEvents: "none" }, _this.rowRendererWithIndex(Math.min(_this.state.dataProvider.getSize() - 1, 1), FlashListProps_1.RenderTargetOptions.Measurement))) : null;
        };
        _this.applyWindowCorrection = function (_, __, correctionObject) {
            var _a;
            correctionObject.windowShift = -_this.distanceFromWindow;
            (_a = _this.stickyContentContainerRef) === null || _a === void 0 ? void 0 : _a.setEnabled(_this.isStickyEnabled);
        };
        _this.rowRendererSticky = function (index) {
            return _this.rowRendererWithIndex(index, FlashListProps_1.RenderTargetOptions.StickyHeader);
        };
        _this.rowRendererWithIndex = function (index, target) {
            var _a, _b, _c;
            // known issue: expected to pass separators which isn't available in RLV
            return (_b = (_a = _this.props).renderItem) === null || _b === void 0 ? void 0 : _b.call(_a, {
                item: _this.props.data[index],
                index: index,
                target: target,
                extraData: (_c = _this.state.extraData) === null || _c === void 0 ? void 0 : _c.value,
            });
        };
        /**
         * This will prevent render item calls unless data changes.
         * Output of this method is received as children object so returning null here is no issue as long as we handle it inside our child container.
         * @module getCellContainerChild acts as the new rowRenderer and is called directly from our child container.
         */
        _this.emptyRowRenderer = function () {
            return null;
        };
        _this.getCellContainerChild = function (index) {
            return (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(react_native_1.View, { style: {
                        flexDirection: _this.props.horizontal || _this.props.numColumns === 1
                            ? "column"
                            : "row",
                    } }, _this.rowRendererWithIndex(index, FlashListProps_1.RenderTargetOptions.Cell)),
                _this.separator(index)));
        };
        _this.recyclerRef = function (ref) {
            _this.rlvRef = ref;
        };
        _this.stickyContentRef = function (ref) {
            _this.stickyContentContainerRef = ref;
        };
        _this.stickyOverrideRowRenderer = function (_, __, index, ___) {
            return (react_1.default.createElement(PureComponentWrapper_1.PureComponentWrapper, { ref: _this.stickyContentRef, enabled: _this.isStickyEnabled, arg: index, renderer: _this.rowRendererSticky }));
        };
        _this.onItemLayout = function (index) {
            // Informing the layout provider about change to an item's layout. It already knows the dimensions so there's not need to pass them.
            _this.state.layoutProvider.reportItemLayout(index);
            _this.raiseOnLoadEventIfNeeded();
        };
        _this.raiseOnLoadEventIfNeeded = function () {
            var _a, _b;
            if (!_this.isListLoaded) {
                _this.isListLoaded = true;
                (_b = (_a = _this.props).onLoad) === null || _b === void 0 ? void 0 : _b.call(_a, {
                    elapsedTimeInMs: Date.now() - _this.loadStartTime,
                });
                _this.runAfterOnLoad();
            }
        };
        _this.runAfterOnLoad = function () {
            if (_this.props.estimatedItemSize === undefined) {
                _this.sizeWarningTimeoutId = setTimeout(function () {
                    var averageItemSize = Math.floor(_this.state.layoutProvider.averageItemSize);
                    console.warn(Warnings_1.default.estimatedItemSizeMissingWarning.replace("@size", averageItemSize.toString()));
                }, 1000);
            }
            _this.postLoadTimeoutId = setTimeout(function () {
                // This force update is required to remove dummy element rendered to measure horizontal list height when  the list doesn't update on its own.
                // In most cases this timeout will never be triggered because list usually updates atleast once and this timeout is cleared on update.
                if (_this.props.horizontal) {
                    _this.forceUpdate();
                }
            }, 500);
        };
        _this.clearPostLoadTimeout = function () {
            if (_this.postLoadTimeoutId !== undefined) {
                clearTimeout(_this.postLoadTimeoutId);
                _this.postLoadTimeoutId = undefined;
            }
        };
        /**
         * Tells the list an interaction has occurred, which should trigger viewability calculations, e.g. if waitForInteractions is true and the user has not scrolled.
         * This is typically called by taps on items or by navigation actions.
         */
        _this.recordInteraction = function () {
            _this.viewabilityManager.recordInteraction();
        };
        _this.loadStartTime = Date.now();
        _this.validateProps();
        if (props.estimatedListSize) {
            if (props.horizontal) {
                _this.listFixedDimensionSize = props.estimatedListSize.height;
            }
            else {
                _this.listFixedDimensionSize = props.estimatedListSize.width;
            }
        }
        _this.distanceFromWindow =
            (_a = props.estimatedFirstItemOffset) !== null && _a !== void 0 ? _a : ((props.ListHeaderComponent && 1) || 0);
        // eslint-disable-next-line react/state-in-constructor
        _this.state = FlashList.getInitialMutableState(_this);
        _this.viewabilityManager = new ViewabilityManager_1.default(_this);
        _this.itemAnimator = (0, PlatformHelper_1.getItemAnimator)();
        return _this;
    }
    FlashList.prototype.validateProps = function () {
        var _a;
        if (this.props.onRefresh && typeof this.props.refreshing !== "boolean") {
            throw new CustomError_1.default(ExceptionList_1.default.refreshBooleanMissing);
        }
        if (Number((_a = this.props.stickyHeaderIndices) === null || _a === void 0 ? void 0 : _a.length) > 0 &&
            this.props.horizontal) {
            throw new CustomError_1.default(ExceptionList_1.default.stickyWhileHorizontalNotSupported);
        }
        if (Number(this.props.numColumns) > 1 && this.props.horizontal) {
            throw new CustomError_1.default(ExceptionList_1.default.columnsWhileHorizontalNotSupported);
        }
        // `createAnimatedComponent` always passes a blank style object. To avoid warning while using AnimatedFlashList we've modified the check
        if (Object.keys(this.props.style || {}).length > 0) {
            console.warn(Warnings_1.default.styleUnsupported);
        }
        if ((0, ContentContainerUtils_1.hasUnsupportedKeysInContentContainerStyle)(this.props.contentContainerStyle)) {
            console.warn(Warnings_1.default.styleContentContainerUnsupported);
        }
    };
    // Some of the state variables need to update when props change
    FlashList.getDerivedStateFromProps = function (nextProps, prevState) {
        var _a;
        var newState = tslib_1.__assign({}, prevState);
        if (prevState.numColumns !== nextProps.numColumns) {
            newState.numColumns = nextProps.numColumns || 1;
            newState.layoutProvider = FlashList.getLayoutProvider(newState.numColumns, nextProps);
        }
        else if (prevState.layoutProvider.updateProps(nextProps).hasExpired) {
            newState.layoutProvider = FlashList.getLayoutProvider(newState.numColumns, nextProps);
            // RLV retries to reposition the first visible item on layout provider change.
            // It's not required in our case so we're disabling it
            newState.layoutProvider.shouldRefreshWithAnchoring = false;
        }
        if (nextProps.data !== prevState.data) {
            newState.data = nextProps.data;
            newState.dataProvider = prevState.dataProvider.cloneWithRows(nextProps.data);
            if (nextProps.renderItem !== prevState.renderItem) {
                newState.extraData = tslib_1.__assign({}, prevState.extraData);
            }
        }
        if (nextProps.extraData !== ((_a = prevState.extraData) === null || _a === void 0 ? void 0 : _a.value)) {
            newState.extraData = { value: nextProps.extraData };
        }
        newState.renderItem = nextProps.renderItem;
        return newState;
    };
    FlashList.getInitialMutableState = function (flashList) {
        var getStableId;
        if (flashList.props.keyExtractor !== null &&
            flashList.props.keyExtractor !== undefined) {
            getStableId = function (index) {
                // We assume `keyExtractor` function will never change from being `null | undefined` to defined and vice versa.
                // Similarly, data should never be `null | undefined` when `getStableId` is called.
                return flashList.props.keyExtractor(flashList.props.data[index], index).toString();
            };
        }
        return {
            data: null,
            layoutProvider: null,
            dataProvider: new recyclerlistview_1.DataProvider(function (r1, r2) {
                return r1 !== r2;
            }, getStableId),
            numColumns: 0,
        };
    };
    // Using only grid layout provider as it can also act as a listview, sizeProvider is a function to support future overrides
    FlashList.getLayoutProvider = function (numColumns, flashListProps) {
        return new GridLayoutProviderWithProps_1.default(
        // max span or, total columns
        numColumns, function (index, props) {
            var _a;
            // type of the item for given index
            var type = (_a = props.getItemType) === null || _a === void 0 ? void 0 : _a.call(props, props.data[index], index, props.extraData);
            return type || 0;
        }, function (index, props, mutableLayout) {
            var _a, _b;
            // span of the item at given index, item can choose to span more than one column
            (_a = props.overrideItemLayout) === null || _a === void 0 ? void 0 : _a.call(props, mutableLayout, props.data[index], index, numColumns, props.extraData);
            return (_b = mutableLayout === null || mutableLayout === void 0 ? void 0 : mutableLayout.span) !== null && _b !== void 0 ? _b : 1;
        }, function (index, props, mutableLayout) {
            var _a;
            // estimated size of the item an given index
            (_a = props.overrideItemLayout) === null || _a === void 0 ? void 0 : _a.call(props, mutableLayout, props.data[index], index, numColumns, props.extraData);
            return mutableLayout === null || mutableLayout === void 0 ? void 0 : mutableLayout.size;
        }, flashListProps);
    };
    FlashList.prototype.componentDidMount = function () {
        var _a;
        if (((_a = this.props.data) === null || _a === void 0 ? void 0 : _a.length) === 0) {
            this.raiseOnLoadEventIfNeeded();
        }
    };
    FlashList.prototype.componentWillUnmount = function () {
        this.viewabilityManager.dispose();
        this.clearPostLoadTimeout();
        if (this.sizeWarningTimeoutId !== undefined) {
            clearTimeout(this.sizeWarningTimeoutId);
        }
    };
    FlashList.prototype.render = function () {
        this.isEmptyList = this.state.dataProvider.getSize() === 0;
        (0, ContentContainerUtils_1.updateContentStyle)(this.contentStyle, this.props.contentContainerStyle);
        var _a = this.props, drawDistance = _a.drawDistance, removeClippedSubviews = _a.removeClippedSubviews, stickyHeaderIndices = _a.stickyHeaderIndices, horizontal = _a.horizontal, onEndReachedThreshold = _a.onEndReachedThreshold, estimatedListSize = _a.estimatedListSize, initialScrollIndex = _a.initialScrollIndex, style = _a.style, contentContainerStyle = _a.contentContainerStyle, renderScrollComponent = _a.renderScrollComponent, restProps = tslib_1.__rest(_a, ["drawDistance", "removeClippedSubviews", "stickyHeaderIndices", "horizontal", "onEndReachedThreshold", "estimatedListSize", "initialScrollIndex", "style", "contentContainerStyle", "renderScrollComponent"]);
        // RecyclerListView simply ignores if initialScrollIndex is set to 0 because it doesn't understand headers
        // Using initialOffset to force RLV to scroll to the right place
        var initialOffset = (this.isInitialScrollIndexInFirstRow() && this.distanceFromWindow) ||
            undefined;
        var finalDrawDistance = drawDistance === undefined
            ? PlatformHelper_1.PlatformConfig.defaultDrawDistance
            : drawDistance;
        return (react_1.default.createElement(StickyHeaderContainer, { overrideRowRenderer: this.stickyOverrideRowRenderer, applyWindowCorrection: this.applyWindowCorrection, stickyHeaderIndices: stickyHeaderIndices, style: this.props.horizontal
                ? tslib_1.__assign({}, this.getTransform()) : tslib_1.__assign({ flex: 1 }, this.getTransform()) },
            react_1.default.createElement(recyclerlistview_1.ProgressiveListView, tslib_1.__assign({}, restProps, { ref: this.recyclerRef, layoutProvider: this.state.layoutProvider, dataProvider: this.state.dataProvider, rowRenderer: this.emptyRowRenderer, canChangeSize: true, isHorizontal: Boolean(horizontal), scrollViewProps: tslib_1.__assign({ onScrollBeginDrag: this.onScrollBeginDrag, onLayout: this.handleSizeChange, refreshControl: this.props.refreshControl || this.getRefreshControl(), 
                    // Min values are being used to suppress RLV's bounded exception
                    style: { minHeight: 1, minWidth: 1 }, contentContainerStyle: tslib_1.__assign({ backgroundColor: this.contentStyle.backgroundColor, flexGrow: this.contentStyle.flexGrow, 
                        // Required to handle a scrollview bug. Check: https://github.com/Shopify/flash-list/pull/187
                        minHeight: 1, minWidth: 1 }, (0, ContentContainerUtils_1.getContentContainerPadding)(this.contentStyle, horizontal)) }, this.props.overrideProps), forceNonDeterministicRendering: true, renderItemContainer: this.itemContainer, renderContentContainer: this.container, onEndReached: this.onEndReached, onEndReachedThresholdRelative: onEndReachedThreshold || undefined, extendedState: this.state.extraData, layoutSize: estimatedListSize, maxRenderAhead: 3 * finalDrawDistance, finalRenderAheadOffset: finalDrawDistance, renderAheadStep: finalDrawDistance, initialRenderIndex: (!this.isInitialScrollIndexInFirstRow() && initialScrollIndex) ||
                    undefined, initialOffset: initialOffset, onItemLayout: this.onItemLayout, onScroll: this.onScroll, onVisibleIndicesChanged: this.viewabilityManager.shouldListenToVisibleIndices
                    ? this.viewabilityManager.onVisibleIndicesChanged
                    : undefined, windowCorrectionConfig: this.getUpdatedWindowCorrectionConfig(), itemAnimator: this.itemAnimator, suppressBoundedSizeException: true, externalScrollView: renderScrollComponent }))));
    };
    FlashList.prototype.getUpdatedWindowCorrectionConfig = function () {
        // If the initial scroll index is in the first row then we're forcing RLV to use initialOffset and thus we need to disable window correction
        // This isn't clean but it's the only way to get RLV to scroll to the right place
        // TODO: Remove this when RLV fixes this. Current implementation will also fail if column span is overridden in the first row.
        if (this.isInitialScrollIndexInFirstRow()) {
            this.windowCorrectionConfig.applyToInitialOffset = false;
        }
        else {
            this.windowCorrectionConfig.applyToInitialOffset = true;
        }
        this.windowCorrectionConfig.value.windowShift = -this.distanceFromWindow;
        return this.windowCorrectionConfig;
    };
    FlashList.prototype.isInitialScrollIndexInFirstRow = function () {
        var _a;
        return (((_a = this.props.initialScrollIndex) !== null && _a !== void 0 ? _a : this.state.numColumns) <
            this.state.numColumns);
    };
    FlashList.prototype.validateListSize = function (event) {
        var _a = event.nativeEvent.layout, height = _a.height, width = _a.width;
        if (Math.floor(height) <= 1 || Math.floor(width) <= 1) {
            console.warn(Warnings_1.default.unusableRenderedSize);
        }
    };
    FlashList.prototype.getTransform = function () {
        var transformStyle = this.props.horizontal
            ? this.transformStyleHorizontal
            : this.transformStyle;
        return (this.props.inverted && transformStyle) || undefined;
    };
    FlashList.prototype.getValidComponent = function (component) {
        var PassedComponent = component;
        return ((react_1.default.isValidElement(PassedComponent) && PassedComponent) ||
            (PassedComponent && react_1.default.createElement(PassedComponent, null)) ||
            null);
    };
    Object.defineProperty(FlashList.prototype, "isStickyEnabled", {
        get: function () {
            var _a;
            var currentOffset = ((_a = this.rlvRef) === null || _a === void 0 ? void 0 : _a.getCurrentScrollOffset()) || 0;
            return currentOffset >= this.distanceFromWindow;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Disables recycling for the next frame so that layout animations run well.
     * Warning: Avoid this when making large changes to the data as the list might draw too much to run animations. Single item insertions/deletions
     * should be good. With recycling paused the list cannot do much optimization.
     * The next render will run as normal and reuse items.
     */
    FlashList.prototype.prepareForLayoutAnimationRender = function () {
        var _a;
        if (this.props.keyExtractor === null ||
            this.props.keyExtractor === undefined) {
            console.warn(Warnings_1.default.missingKeyExtractor);
        }
        else {
            (_a = this.rlvRef) === null || _a === void 0 ? void 0 : _a.prepareForLayoutAnimationRender();
        }
    };
    FlashList.prototype.scrollToEnd = function (params) {
        var _a;
        (_a = this.rlvRef) === null || _a === void 0 ? void 0 : _a.scrollToEnd(Boolean(params === null || params === void 0 ? void 0 : params.animated));
    };
    FlashList.prototype.scrollToIndex = function (params) {
        var _a, _b, _c, _d, _e;
        var layout = (_a = this.rlvRef) === null || _a === void 0 ? void 0 : _a.getLayout(params.index);
        var listSize = (_b = this.rlvRef) === null || _b === void 0 ? void 0 : _b.getRenderedSize();
        if (layout && listSize) {
            var itemOffset = this.props.horizontal ? layout.x : layout.y;
            var fixedDimension = this.props.horizontal
                ? listSize.width
                : listSize.height;
            var itemSize = this.props.horizontal ? layout.width : layout.height;
            var scrollOffset = Math.max(0, itemOffset - ((_c = params.viewPosition) !== null && _c !== void 0 ? _c : 0) * (fixedDimension - itemSize)) - ((_d = params.viewOffset) !== null && _d !== void 0 ? _d : 0);
            (_e = this.rlvRef) === null || _e === void 0 ? void 0 : _e.scrollToOffset(scrollOffset, scrollOffset, Boolean(params.animated), true);
        }
    };
    FlashList.prototype.scrollToItem = function (params) {
        var _a, _b;
        var index = (_b = (_a = this.props.data) === null || _a === void 0 ? void 0 : _a.indexOf(params.item)) !== null && _b !== void 0 ? _b : -1;
        if (index >= 0) {
            this.scrollToIndex(tslib_1.__assign(tslib_1.__assign({}, params), { index: index }));
        }
    };
    FlashList.prototype.scrollToOffset = function (params) {
        var _a;
        var x = this.props.horizontal ? params.offset : 0;
        var y = this.props.horizontal ? 0 : params.offset;
        (_a = this.rlvRef) === null || _a === void 0 ? void 0 : _a.scrollToOffset(x, y, Boolean(params.animated));
    };
    FlashList.prototype.getScrollableNode = function () {
        var _a, _b;
        return ((_b = (_a = this.rlvRef) === null || _a === void 0 ? void 0 : _a.getScrollableNode) === null || _b === void 0 ? void 0 : _b.call(_a)) || null;
    };
    Object.defineProperty(FlashList.prototype, "recyclerlistview_unsafe", {
        /**
         * Allows access to internal recyclerlistview. This is useful for enabling access to its public APIs.
         * Warning: We may swap recyclerlistview for something else in the future. Use with caution.
         */
        /* eslint-disable @typescript-eslint/naming-convention */
        get: function () {
            return this.rlvRef;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FlashList.prototype, "firstItemOffset", {
        /**
         * Specifies how far the first item is from top of the list. This would normally be a sum of header size and top/left padding applied to the list.
         */
        get: function () {
            return this.distanceFromWindow;
        },
        enumerable: false,
        configurable: true
    });
    FlashList.defaultProps = {
        data: [],
        numColumns: 1,
    };
    return FlashList;
}(react_1.default.PureComponent));
exports.default = FlashList;
//# sourceMappingURL=FlashList.js.map