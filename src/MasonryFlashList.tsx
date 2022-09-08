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
import { FlashListProps } from "./FlashListProps";
import ViewToken from "./viewability/ViewToken";

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
   * e.g, if numColumns is 3, you can return 1.25 for index 1 and 0.75 for the rest to achieve a 1:2:1 split by size
   */
  getColumnSizeMultiplier?: (
    items: MasonryListData<T>[],
    columnIndex: number,
    maxColumns: number,
    extraData?: any
  ) => number | undefined;

  /**
   * If enabled, MasonryFlashList will try to reduce difference in column height by modifying item order.
   * `overrideItemLayout` is required to make this work.
   */
  optimizeItemArrangement?: boolean;
}

type OnScrollCallback = ScrollViewProps["onScroll"];

export interface MasonryFlashListScrollEvent extends NativeScrollEvent {
  doNotPropagate?: boolean;
}

export interface MasonryListData<T> {
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
 * `MasonryFlashList` will not compute most optimal arrangement for you automatically. You can use the `useMasonryLayoutOptimizer` preprocessing hook to improve item arrangement.
 */
const MasonryFlashListComponent = React.forwardRef(
  <T,>(
    /**
     * Forward Ref will force cast generic parament T to unknown. Export has a explicit cast to solve this.
     * */
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

    const onScrollRef = useRef<OnScrollCallback[]>([]);
    const emptyScrollEvent = useRef(getBlackScrollEvent())
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

    const onLoadForNestedLists = useRef((args: { elapsedTimeInMs: number }) => {
      setTimeout(() => {
        emptyScrollEvent.nativeEvent.doNotPropagate = true;
        onScrollProxy?.(emptyScrollEvent);
        emptyScrollEvent.nativeEvent.doNotPropagate = false;
      }, 32);
      props.onLoad?.(args);
    }).current;

    const [parentFlashList, getFlashList] =
      useRefWithForwardRef<FlashList<MasonryListData<T>[]>>(forwardRef);

    const {
      renderItem,
      getItemType,
      getColumnSizeMultiplier,
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

    return (
      <FlashList
        ref={getFlashList}
        {...remainingProps}
        horizontal={false}
        numColumns={columnCount}
        data={dataSet}
        onScroll={onScrollProxy}
        estimatedItemSize={estimatedListSize.height}
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
                    columnCount) *
                  (getColumnSizeMultiplier?.(
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
                      updateViewToken(info.viewableItems);
                      updateViewToken(info.changed);
                      onViewableItemsChanged?.(info);
                    }
                  : undefined
              }
              overrideItemLayout={
                overrideItemLayout
                  ? (layout, item, index, _, extraData) => {
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
          getColumnSizeMultiplier
            ? (layout, item, index, maxColumns, extraData) => {
                layout.span = getColumnSizeMultiplier?.(
                  item,
                  index,
                  maxColumns,
                  extraData
                );
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
  autoOptimizeLayout: boolean,
  sourceData?: FlashListProps<T>["data"],
  overrideItemLayout?: MasonryFlashListProps<T>["overrideItemLayout"],
  extraData?: MasonryFlashListProps<T>["extraData"]
): MasonryListData<T>[][] => {
  return useMemo(() => {
    if (!sourceData || sourceData.length === 0) {
      return [];
    }
    const columnHeightTracker = new Array<number>(columnCount).fill(0);
    const layoutObject = { size: 1 };
    const dataSet = new Array<MasonryListData<T>[]>(columnCount);
    const dataSize = sourceData.length;

    for (let i = 0; i < columnCount; i++) {
      dataSet[i] = [];
    }
    for (let i = 0; i < dataSize; i++) {
      let nextColumnIndex = i % columnCount;
      if (autoOptimizeLayout) {
        for (let j = 0; j < columnCount; j++) {
          if (columnHeightTracker[j] < columnHeightTracker[nextColumnIndex]) {
            nextColumnIndex = j;
          }
        }
        // update height of column
        overrideItemLayout!(
          layoutObject,
          sourceData[i],
          i,
          columnCount,
          extraData
        );
        columnHeightTracker[nextColumnIndex] += layoutObject.size;
      }
      dataSet[nextColumnIndex].push({
        originalItem: sourceData[i],
        originalIndex: i,
      });
    }
    return dataSet;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceData, columnCount, autoOptimizeLayout, extraData]);
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
const updateViewToken = (tokens: ViewToken[]) => {
  const length = tokens.length;
  for (let i = 0; i < length; i++) {
    const token = tokens[i];
    if (token.index !== null && token.index !== undefined) {
      token.index = token.item.originalIndex;
      token.item = token.item.originalItem;
    }
  }
};
const getBlackScrollEvent = () => {
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
 * `MasonryFlashList` will not compute most optimal arrangement for you automatically. You can use the `useMasonryLayoutOptimizer` preprocessing hook to improve item arrangement.
 */
export const MasonryFlashList = MasonryFlashListComponent as <T>(
  props: MasonryFlashListProps<T> & {
    ref?: React.RefObject<MasonryFlashListRef<T>>;
  }
) => React.ReactElement;
