import React, { useCallback, useRef, useEffect, useMemo } from "react";
import {
  View,
  Dimensions,
  ScrollViewProps,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";

import CustomError from "./errors/CustomError";
import ExceptionList from "./errors/ExceptionList";
import FlashList from "./FlashList";
import { FlashListProps, ListRenderItemInfo } from "./FlashListProps";
import ViewToken from "./viewability/ViewToken";

export interface MasonryListRenderItemInfo<TItem>
  extends ListRenderItemInfo<TItem> {
  columnSpan: number;
  columnIndex: number;
}

export type MasonryListRenderItem<TItem> = (
  info: MasonryListRenderItemInfo<TItem>
) => React.ReactElement | null;

export interface MasonryFlashListProps<T>
  extends Omit<
    FlashListProps<T>,
    | "horizontal"
    | "initialScrollIndex"
    | "inverted"
    | "onBlankArea"
    | "viewabilityConfigCallbackPairs"
  > {
  /**
   * Allows you to change the column widths of the list. This is helpful if you want some columns to be wider than the others.
   * e.g, if `numColumns` is `3`, you can return `2` for `index 1` and `1` for the rest to achieve a `1:2:1` split by width.
   */
  getColumnFlex?: (
    items: MasonryListItem<T>[],
    columnIndex: number,
    maxColumns: number,
    extraData?: any
  ) => number;

  /**
   * If enabled, MasonryFlashList will try to reduce difference in column height by modifying item order.
   * `overrideItemLayout` is required to make this work.
   */
  optimizeItemArrangement?: boolean;

  /**
   * Extends typical `renderItem` to include `columnIndex` and `columnSpan` (number of columns the item spans).
   * `columnIndex` gives the consumer column information in case they might need to treat items differently based on column.
   * This information may not otherwise be derived if using the `optimizeItemArrangement` feature, as the items will no
   * longer be linearly distributed across the columns; instead they are allocated to the column with the least estimated height.
   */
  renderItem: MasonryListRenderItem<T> | null | undefined;
}

type OnScrollCallback = ScrollViewProps["onScroll"];
const defaultEstimatedItemSize = 100;

export interface MasonryFlashListScrollEvent extends NativeScrollEvent {
  doNotPropagate?: boolean;
}

export interface MasonryListItem<T> {
  originalIndex: number;
  originalItem: T;
}

/**
 * MasonryFlashListRef with support for scroll related methods
 */
export interface MasonryFlashListRef<T> {
  scrollToOffset: FlashList<T>["scrollToOffset"];
  scrollToEnd: FlashList<T>["scrollToEnd"];
  getScrollableNode: FlashList<T>["getScrollableNode"];
}

/**
 * FlashList variant that enables rendering of masonry layouts.
 * If you want `MasonryFlashList` to optimize item arrangement, enable `optimizeItemArrangement` and pass a valid `overrideItemLayout` function.
 */
const MasonryFlashListComponent = React.forwardRef(
  <T,>(
    /**
     * Forward Ref will force cast generic parament T to unknown. Export has a explicit cast to solve this.
     */
    props: MasonryFlashListProps<T>,
    forwardRef: React.ForwardedRef<MasonryFlashListRef<T>>
  ) => {
    const columnCount = props.numColumns || 1;
    const drawDistance = props.drawDistance;
    const estimatedListSize = props.estimatedListSize ??
      Dimensions.get("window") ?? { height: 500, width: 500 };

    if (props.optimizeItemArrangement && !props.overrideItemLayout) {
      throw new CustomError(
        ExceptionList.overrideItemLayoutRequiredForMasonryOptimization
      );
    }
    const dataSet = useDataSet(
      columnCount,
      Boolean(props.optimizeItemArrangement),
      props.data,
      props.overrideItemLayout,
      props.extraData
    );

    const totalColumnFlex = useTotalColumnFlex(dataSet, props);

    const onScrollRef = useRef<OnScrollCallback[]>([]);
    const emptyScrollEvent = useRef(getEmptyScrollEvent())
      .current as NativeSyntheticEvent<MasonryFlashListScrollEvent>;
    const ScrollComponent = useRef(
      getFlashListScrollView(onScrollRef, () => {
        return (
          getListRenderedSize(parentFlashList)?.height ||
          estimatedListSize.height
        );
      })
    ).current;

    const onScrollProxy = useRef<OnScrollCallback>(
      (scrollEvent: NativeSyntheticEvent<MasonryFlashListScrollEvent>) => {
        emptyScrollEvent.nativeEvent.contentOffset.y =
          scrollEvent.nativeEvent.contentOffset.y -
          (parentFlashList.current?.firstItemOffset ?? 0);
        onScrollRef.current?.forEach((onScrollCallback) => {
          onScrollCallback?.(emptyScrollEvent);
        });
        if (!scrollEvent.nativeEvent.doNotPropagate) {
          props.onScroll?.(scrollEvent);
        }
      }
    ).current;

    /**
     * We're triggering an onScroll on internal lists so that they register the correct offset which is offset - header size.
     * This will make sure viewability callbacks are triggered correctly.
     * 32 ms is equal to two frames at 60 fps. Faster framerates will not cause any problems.
     */
    const onLoadForNestedLists = useRef((args: { elapsedTimeInMs: number }) => {
      setTimeout(() => {
        emptyScrollEvent.nativeEvent.doNotPropagate = true;
        onScrollProxy?.(emptyScrollEvent);
        emptyScrollEvent.nativeEvent.doNotPropagate = false;
      }, 32);
      props.onLoad?.(args);
    }).current;

    const [parentFlashList, getFlashList] =
      useRefWithForwardRef<FlashList<MasonryListItem<T>[]>>(forwardRef);

    const {
      renderItem,
      getItemType,
      getColumnFlex,
      overrideItemLayout,
      viewabilityConfig,
      keyExtractor,
      onLoad,
      onViewableItemsChanged,
      data,
      stickyHeaderIndices,
      CellRendererComponent,
      ItemSeparatorComponent,
      ...remainingProps
    } = props;

    const firstColumnHeight =
      (dataSet[0]?.length ?? 0) *
      (props.estimatedItemSize ?? defaultEstimatedItemSize);

    return (
      <FlashList
        ref={getFlashList}
        {...remainingProps}
        horizontal={false}
        numColumns={columnCount}
        data={dataSet}
        onScroll={onScrollProxy}
        estimatedItemSize={firstColumnHeight || estimatedListSize.height}
        renderItem={(args) => {
          return (
            <FlashList
              renderScrollComponent={ScrollComponent}
              estimatedItemSize={props.estimatedItemSize}
              data={args.item}
              onLoad={args.index === 0 ? onLoadForNestedLists : undefined}
              renderItem={(innerArgs) => {
                return (
                  renderItem?.({
                    ...innerArgs,
                    item: innerArgs.item.originalItem,
                    index: innerArgs.item.originalIndex,
                    columnSpan: 1,
                    columnIndex: args.index,
                  }) ?? null
                );
              }}
              keyExtractor={
                keyExtractor
                  ? (item, _) => {
                      return keyExtractor?.(
                        item.originalItem,
                        item.originalIndex
                      );
                    }
                  : undefined
              }
              getItemType={
                getItemType
                  ? (item, _, extraData) => {
                      return getItemType?.(
                        item.originalItem,
                        item.originalIndex,
                        extraData
                      );
                    }
                  : undefined
              }
              drawDistance={drawDistance}
              estimatedListSize={{
                height: estimatedListSize.height,
                width:
                  ((getListRenderedSize(parentFlashList)?.width ||
                    estimatedListSize.width) /
                    totalColumnFlex) *
                  (getColumnFlex?.(
                    args.item,
                    args.index,
                    columnCount,
                    props.extraData
                  ) ?? 1),
              }}
              extraData={props.extraData}
              CellRendererComponent={CellRendererComponent}
              ItemSeparatorComponent={ItemSeparatorComponent}
              viewabilityConfig={viewabilityConfig}
              onViewableItemsChanged={
                onViewableItemsChanged
                  ? (info) => {
                      updateViewTokens(info.viewableItems);
                      updateViewTokens(info.changed);
                      onViewableItemsChanged?.(info);
                    }
                  : undefined
              }
              overrideItemLayout={
                overrideItemLayout
                  ? (layout, item, _, __, extraData) => {
                      overrideItemLayout?.(
                        layout,
                        item.originalItem,
                        item.originalIndex,
                        columnCount,
                        extraData
                      );
                      layout.span = undefined;
                    }
                  : undefined
              }
            />
          );
        }}
        overrideItemLayout={
          getColumnFlex
            ? (layout, item, index, maxColumns, extraData) => {
                layout.span =
                  (columnCount *
                    getColumnFlex(item, index, maxColumns, extraData)) /
                  totalColumnFlex;
              }
            : undefined
        }
      />
    );
  }
);

/**
 * Splits data for each column's FlashList
 */
const useDataSet = <T,>(
  columnCount: number,
  optimizeItemArrangement: boolean,
  sourceData?: FlashListProps<T>["data"],
  overrideItemLayout?: MasonryFlashListProps<T>["overrideItemLayout"],
  extraData?: MasonryFlashListProps<T>["extraData"]
): MasonryListItem<T>[][] => {
  return useMemo(() => {
    if (!sourceData || sourceData.length === 0) {
      return [];
    }
    const columnHeightTracker = new Array<number>(columnCount).fill(0);
    const layoutObject: { size: number | undefined } = { size: undefined };
    const dataSet = new Array<MasonryListItem<T>[]>(columnCount);
    const dataSize = sourceData.length;

    for (let i = 0; i < columnCount; i++) {
      dataSet[i] = [];
    }
    for (let i = 0; i < dataSize; i++) {
      let nextColumnIndex = i % columnCount;
      if (optimizeItemArrangement) {
        for (let j = 0; j < columnCount; j++) {
          if (columnHeightTracker[j] < columnHeightTracker[nextColumnIndex]) {
            nextColumnIndex = j;
          }
        }
        // update height of column
        layoutObject.size = undefined;
        overrideItemLayout!(
          layoutObject,
          sourceData[i],
          i,
          columnCount,
          extraData
        );
        columnHeightTracker[nextColumnIndex] +=
          layoutObject.size ?? defaultEstimatedItemSize;
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

const useTotalColumnFlex = <T,>(
  dataSet: MasonryListItem<T>[][],
  props: MasonryFlashListProps<T>
): number => {
  return useMemo(() => {
    const columnCount = props.numColumns || 1;
    if (!props.getColumnFlex) {
      return columnCount;
    }
    let totalFlexSum = 0;
    const dataSize = dataSet.length;
    for (let i = 0; i < dataSize; i++) {
      totalFlexSum += props.getColumnFlex(
        dataSet[i],
        i,
        columnCount,
        props.extraData
      );
    }
    return totalFlexSum;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSet, props.getColumnFlex, props.extraData]);
};

/**
 * Handle both function refs and refs with current property
 */
const useRefWithForwardRef = <T,>(
  forwardRef: any
): [React.MutableRefObject<T | null>, (instance: T | null) => void] => {
  const ref: React.MutableRefObject<T | null> = useRef(null);
  return [
    ref,
    useCallback(
      (instance: T | null) => {
        ref.current = instance;
        if (typeof forwardRef === "function") {
          forwardRef(instance);
        } else if (forwardRef) {
          forwardRef.current = instance;
        }
      },
      [forwardRef]
    ),
  ];
};

/**
 * This ScrollView is actually just a view mimicking a scrollview. We block the onScroll event from being passed to the parent list directly.
 * We manually drive onScroll from the parent and thus, achieve recycling.
 */
const getFlashListScrollView = (
  onScrollRef: React.RefObject<OnScrollCallback[]>,
  getParentHeight: () => number
) => {
  const FlashListScrollView = React.forwardRef(
    (props: ScrollViewProps, ref: React.ForwardedRef<View>) => {
      const { onLayout, onScroll, ...rest } = props;
      const onLayoutProxy = useCallback(
        (layoutEvent: LayoutChangeEvent) => {
          onLayout?.({
            nativeEvent: {
              layout: {
                height: getParentHeight(),
                width: layoutEvent.nativeEvent.layout.width,
              },
            },
          } as LayoutChangeEvent);
        },
        [onLayout]
      );
      useEffect(() => {
        if (onScroll) {
          onScrollRef.current?.push(onScroll);
        }
        return () => {
          if (!onScrollRef.current || !onScroll) {
            return;
          }
          const indexToDelete = onScrollRef.current.indexOf(onScroll);
          if (indexToDelete > -1) {
            onScrollRef.current.splice(indexToDelete, 1);
          }
        };
      }, [onScroll]);
      return <View ref={ref} {...rest} onLayout={onLayoutProxy} />;
    }
  );
  FlashListScrollView.displayName = "FlashListScrollView";
  return FlashListScrollView;
};
const updateViewTokens = (tokens: ViewToken[]) => {
  const length = tokens.length;
  for (let i = 0; i < length; i++) {
    const token = tokens[i];
    if (token.index !== null && token.index !== undefined) {
      token.index = token.item.originalIndex;
      token.item = token.item.originalItem;
    }
  }
};

const getEmptyScrollEvent = () => {
  return {
    nativeEvent: { contentOffset: { y: 0, x: 0 } },
  };
};
const getListRenderedSize = <T,>(
  parentFlashList: React.MutableRefObject<FlashList<T[]> | null>
) => {
  return parentFlashList?.current?.recyclerlistview_unsafe?.getRenderedSize();
};
MasonryFlashListComponent.displayName = "MasonryFlashList";

/**
 * FlashList variant that enables rendering of masonry layouts.
 * If you want `MasonryFlashList` to optimize item arrangement, enable `optimizeItemArrangement` and pass a valid `overrideItemLayout` function.
 */
export const MasonryFlashList = MasonryFlashListComponent as <T>(
  props: MasonryFlashListProps<T> & {
    ref?: React.RefObject<MasonryFlashListRef<T>>;
  }
) => React.ReactElement;
