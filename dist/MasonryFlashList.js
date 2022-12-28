"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MasonryFlashList = void 0;
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importStar(require("react"));
var react_native_1 = require("react-native");
var CustomError_1 = tslib_1.__importDefault(require("./errors/CustomError"));
var ExceptionList_1 = tslib_1.__importDefault(require("./errors/ExceptionList"));
var FlashList_1 = tslib_1.__importDefault(require("./FlashList"));
var ContentContainerUtils_1 = require("./utils/ContentContainerUtils");
var defaultEstimatedItemSize = 100;
/**
 * FlashList variant that enables rendering of masonry layouts.
 * If you want `MasonryFlashList` to optimize item arrangement, enable `optimizeItemArrangement` and pass a valid `overrideItemLayout` function.
 */
var MasonryFlashListComponent = react_1.default.forwardRef(function (
/**
 * Forward Ref will force cast generic parament T to unknown. Export has a explicit cast to solve this.
 */
props, forwardRef) {
    var _a, _b, _c, _d, _e;
    var columnCount = props.numColumns || 1;
    var drawDistance = props.drawDistance;
    var estimatedListSize = (_b = (_a = props.estimatedListSize) !== null && _a !== void 0 ? _a : react_native_1.Dimensions.get("window")) !== null && _b !== void 0 ? _b : { height: 500, width: 500 };
    if (props.optimizeItemArrangement && !props.overrideItemLayout) {
        throw new CustomError_1.default(ExceptionList_1.default.overrideItemLayoutRequiredForMasonryOptimization);
    }
    var dataSet = useDataSet(columnCount, Boolean(props.optimizeItemArrangement), props.data, props.overrideItemLayout, props.extraData);
    var totalColumnFlex = useTotalColumnFlex(dataSet, props);
    var onScrollRef = (0, react_1.useRef)([]);
    var emptyScrollEvent = (0, react_1.useRef)(getEmptyScrollEvent())
        .current;
    var ScrollComponent = (0, react_1.useRef)(getFlashListScrollView(onScrollRef, function () {
        var _a;
        return (((_a = getListRenderedSize(parentFlashList)) === null || _a === void 0 ? void 0 : _a.height) ||
            estimatedListSize.height);
    })).current;
    var onScrollProxy = (0, react_1.useRef)(function (scrollEvent) {
        var _a, _b, _c, _d;
        emptyScrollEvent.nativeEvent.contentOffset.y =
            scrollEvent.nativeEvent.contentOffset.y -
                ((_b = (_a = parentFlashList.current) === null || _a === void 0 ? void 0 : _a.firstItemOffset) !== null && _b !== void 0 ? _b : 0);
        (_c = onScrollRef.current) === null || _c === void 0 ? void 0 : _c.forEach(function (onScrollCallback) {
            onScrollCallback === null || onScrollCallback === void 0 ? void 0 : onScrollCallback(emptyScrollEvent);
        });
        if (!scrollEvent.nativeEvent.doNotPropagate) {
            (_d = props.onScroll) === null || _d === void 0 ? void 0 : _d.call(props, scrollEvent);
        }
    }).current;
    /**
     * We're triggering an onScroll on internal lists so that they register the correct offset which is offset - header size.
     * This will make sure viewability callbacks are triggered correctly.
     * 32 ms is equal to two frames at 60 fps. Faster framerates will not cause any problems.
     */
    var onLoadForNestedLists = (0, react_1.useRef)(function (args) {
        var _a;
        setTimeout(function () {
            emptyScrollEvent.nativeEvent.doNotPropagate = true;
            onScrollProxy === null || onScrollProxy === void 0 ? void 0 : onScrollProxy(emptyScrollEvent);
            emptyScrollEvent.nativeEvent.doNotPropagate = false;
        }, 32);
        (_a = props.onLoad) === null || _a === void 0 ? void 0 : _a.call(props, args);
    }).current;
    var _f = tslib_1.__read(useRefWithForwardRef(forwardRef), 2), parentFlashList = _f[0], getFlashList = _f[1];
    var renderItem = props.renderItem, getItemType = props.getItemType, getColumnFlex = props.getColumnFlex, overrideItemLayout = props.overrideItemLayout, viewabilityConfig = props.viewabilityConfig, keyExtractor = props.keyExtractor, onLoad = props.onLoad, onViewableItemsChanged = props.onViewableItemsChanged, data = props.data, stickyHeaderIndices = props.stickyHeaderIndices, CellRendererComponent = props.CellRendererComponent, ItemSeparatorComponent = props.ItemSeparatorComponent, remainingProps = tslib_1.__rest(props, ["renderItem", "getItemType", "getColumnFlex", "overrideItemLayout", "viewabilityConfig", "keyExtractor", "onLoad", "onViewableItemsChanged", "data", "stickyHeaderIndices", "CellRendererComponent", "ItemSeparatorComponent"]);
    var firstColumnHeight = ((_d = (_c = dataSet[0]) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0) *
        ((_e = props.estimatedItemSize) !== null && _e !== void 0 ? _e : defaultEstimatedItemSize);
    var insetForLayoutManager = (0, ContentContainerUtils_1.applyContentContainerInsetForLayoutManager)({ height: 0, width: 0 }, props.contentContainerStyle, false);
    return (react_1.default.createElement(FlashList_1.default, tslib_1.__assign({ ref: getFlashList }, remainingProps, { horizontal: false, numColumns: columnCount, data: dataSet, onScroll: onScrollProxy, estimatedItemSize: firstColumnHeight || estimatedListSize.height, renderItem: function (args) {
            var _a, _b;
            return (react_1.default.createElement(FlashList_1.default, { renderScrollComponent: ScrollComponent, estimatedItemSize: props.estimatedItemSize, data: args.item, onLoad: args.index === 0 ? onLoadForNestedLists : undefined, renderItem: function (innerArgs) {
                    var _a;
                    return ((_a = renderItem === null || renderItem === void 0 ? void 0 : renderItem(tslib_1.__assign(tslib_1.__assign({}, innerArgs), { item: innerArgs.item.originalItem, index: innerArgs.item.originalIndex, columnSpan: 1, columnIndex: args.index }))) !== null && _a !== void 0 ? _a : null);
                }, keyExtractor: keyExtractor
                    ? function (item, _) {
                        return keyExtractor === null || keyExtractor === void 0 ? void 0 : keyExtractor(item.originalItem, item.originalIndex);
                    }
                    : undefined, getItemType: getItemType
                    ? function (item, _, extraData) {
                        return getItemType === null || getItemType === void 0 ? void 0 : getItemType(item.originalItem, item.originalIndex, extraData);
                    }
                    : undefined, drawDistance: drawDistance, estimatedListSize: {
                    height: estimatedListSize.height,
                    width: (((((_a = getListRenderedSize(parentFlashList)) === null || _a === void 0 ? void 0 : _a.width) ||
                        estimatedListSize.width) +
                        insetForLayoutManager.width) /
                        totalColumnFlex) *
                        ((_b = getColumnFlex === null || getColumnFlex === void 0 ? void 0 : getColumnFlex(args.item, args.index, columnCount, props.extraData)) !== null && _b !== void 0 ? _b : 1),
                }, extraData: props.extraData, CellRendererComponent: CellRendererComponent, ItemSeparatorComponent: ItemSeparatorComponent, viewabilityConfig: viewabilityConfig, onViewableItemsChanged: onViewableItemsChanged
                    ? function (info) {
                        updateViewTokens(info.viewableItems);
                        updateViewTokens(info.changed);
                        onViewableItemsChanged === null || onViewableItemsChanged === void 0 ? void 0 : onViewableItemsChanged(info);
                    }
                    : undefined, overrideItemLayout: overrideItemLayout
                    ? function (layout, item, _, __, extraData) {
                        overrideItemLayout === null || overrideItemLayout === void 0 ? void 0 : overrideItemLayout(layout, item.originalItem, item.originalIndex, columnCount, extraData);
                        layout.span = undefined;
                    }
                    : undefined }));
        }, overrideItemLayout: getColumnFlex
            ? function (layout, item, index, maxColumns, extraData) {
                layout.span =
                    (columnCount *
                        getColumnFlex(item, index, maxColumns, extraData)) /
                        totalColumnFlex;
            }
            : undefined })));
});
/**
 * Splits data for each column's FlashList
 */
var useDataSet = function (columnCount, optimizeItemArrangement, sourceData, overrideItemLayout, extraData) {
    return (0, react_1.useMemo)(function () {
        var _a;
        if (!sourceData || sourceData.length === 0) {
            return [];
        }
        var columnHeightTracker = new Array(columnCount).fill(0);
        var layoutObject = { size: undefined };
        var dataSet = new Array(columnCount);
        var dataSize = sourceData.length;
        for (var i = 0; i < columnCount; i++) {
            dataSet[i] = [];
        }
        for (var i = 0; i < dataSize; i++) {
            var nextColumnIndex = i % columnCount;
            if (optimizeItemArrangement) {
                for (var j = 0; j < columnCount; j++) {
                    if (columnHeightTracker[j] < columnHeightTracker[nextColumnIndex]) {
                        nextColumnIndex = j;
                    }
                }
                // update height of column
                layoutObject.size = undefined;
                overrideItemLayout(layoutObject, sourceData[i], i, columnCount, extraData);
                columnHeightTracker[nextColumnIndex] +=
                    (_a = layoutObject.size) !== null && _a !== void 0 ? _a : defaultEstimatedItemSize;
            }
            dataSet[nextColumnIndex].push({
                originalItem: sourceData[i],
                originalIndex: i,
            });
        }
        return dataSet;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sourceData, columnCount, optimizeItemArrangement, extraData]);
};
var useTotalColumnFlex = function (dataSet, props) {
    return (0, react_1.useMemo)(function () {
        var columnCount = props.numColumns || 1;
        if (!props.getColumnFlex) {
            return columnCount;
        }
        var totalFlexSum = 0;
        var dataSize = dataSet.length;
        for (var i = 0; i < dataSize; i++) {
            totalFlexSum += props.getColumnFlex(dataSet[i], i, columnCount, props.extraData);
        }
        return totalFlexSum;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataSet, props.getColumnFlex, props.extraData]);
};
/**
 * Handle both function refs and refs with current property
 */
var useRefWithForwardRef = function (forwardRef) {
    var ref = (0, react_1.useRef)(null);
    return [
        ref,
        (0, react_1.useCallback)(function (instance) {
            ref.current = instance;
            if (typeof forwardRef === "function") {
                forwardRef(instance);
            }
            else if (forwardRef) {
                forwardRef.current = instance;
            }
        }, [forwardRef]),
    ];
};
/**
 * This ScrollView is actually just a view mimicking a scrollview. We block the onScroll event from being passed to the parent list directly.
 * We manually drive onScroll from the parent and thus, achieve recycling.
 */
var getFlashListScrollView = function (onScrollRef, getParentHeight) {
    var FlashListScrollView = react_1.default.forwardRef(function (props, ref) {
        var onLayout = props.onLayout, onScroll = props.onScroll, rest = tslib_1.__rest(props, ["onLayout", "onScroll"]);
        var onLayoutProxy = (0, react_1.useCallback)(function (layoutEvent) {
            onLayout === null || onLayout === void 0 ? void 0 : onLayout({
                nativeEvent: {
                    layout: {
                        height: getParentHeight(),
                        width: layoutEvent.nativeEvent.layout.width,
                    },
                },
            });
        }, [onLayout]);
        (0, react_1.useEffect)(function () {
            var _a;
            if (onScroll) {
                (_a = onScrollRef.current) === null || _a === void 0 ? void 0 : _a.push(onScroll);
            }
            return function () {
                if (!onScrollRef.current || !onScroll) {
                    return;
                }
                var indexToDelete = onScrollRef.current.indexOf(onScroll);
                if (indexToDelete > -1) {
                    onScrollRef.current.splice(indexToDelete, 1);
                }
            };
        }, [onScroll]);
        return react_1.default.createElement(react_native_1.View, tslib_1.__assign({ ref: ref }, rest, { onLayout: onLayoutProxy }));
    });
    FlashListScrollView.displayName = "FlashListScrollView";
    return FlashListScrollView;
};
var updateViewTokens = function (tokens) {
    var length = tokens.length;
    for (var i = 0; i < length; i++) {
        var token = tokens[i];
        if (token.index !== null && token.index !== undefined) {
            if (token.item) {
                token.index = token.item.originalIndex;
                token.item = token.item.originalItem;
            }
            else {
                token.index = null;
                token.item = undefined;
            }
        }
    }
};
var getEmptyScrollEvent = function () {
    return {
        nativeEvent: { contentOffset: { y: 0, x: 0 } },
    };
};
var getListRenderedSize = function (parentFlashList) {
    var _a, _b;
    return (_b = (_a = parentFlashList === null || parentFlashList === void 0 ? void 0 : parentFlashList.current) === null || _a === void 0 ? void 0 : _a.recyclerlistview_unsafe) === null || _b === void 0 ? void 0 : _b.getRenderedSize();
};
MasonryFlashListComponent.displayName = "MasonryFlashList";
/**
 * FlashList variant that enables rendering of masonry layouts.
 * If you want `MasonryFlashList` to optimize item arrangement, enable `optimizeItemArrangement` and pass a valid `overrideItemLayout` function.
 */
exports.MasonryFlashList = MasonryFlashListComponent;
//# sourceMappingURL=MasonryFlashList.js.map