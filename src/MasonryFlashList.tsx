import React, { useCallback, useRef, useEffect, useMemo } from "react";
import {
  View,
  Dimensions,
  ScrollViewProps,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";

import FlashList from "./FlashList";
import { FlashListProps } from "./FlashListProps";
import { PlatformConfig } from "./native/config/PlatformHelper";
import ViewToken from "./viewability/ViewToken";

export interface MasonryFlashListProps<T> {
  data?: FlashListProps<T>["data"];
  numColumns?: FlashListProps<T>["numColumns"];
  estimatedListSize?: FlashListProps<T>["estimatedListSize"];
  estimatedItemSize?: FlashListProps<T>["estimatedItemSize"];
  onEndReached?: FlashListProps<T>["onEndReached"];
  drawDistance?: FlashListProps<T>["drawDistance"];
  renderItem: FlashListProps<T>["renderItem"];
  onEndReachedThreshold?: FlashListProps<T>["onEndReachedThreshold"];
  extraData?: FlashListProps<T>["extraData"];
  onScroll?: FlashListProps<T>["onScroll"];
  contentContainerStyle?: FlashListProps<T>["contentContainerStyle"];
  ListFooterComponent?: FlashListProps<T>["ListFooterComponent"];
  ListHeaderComponent?: FlashListProps<T>["ListHeaderComponent"];
  ListEmptyComponent?: FlashListProps<T>["ListEmptyComponent"];
  ListFooterComponentStyle?: FlashListProps<T>["ListFooterComponentStyle"];
  ListHeaderComponentStyle?: FlashListProps<T>["ListHeaderComponentStyle"];
  viewabilityConfig?: FlashListProps<T>["viewabilityConfig"];
  onViewableItemsChanged?: FlashListProps<T>["onViewableItemsChanged"];
}

type OnScrollCallback = ScrollViewProps["onScroll"];

export interface MasonryFlashListRef<T> {
  scrollToOffset: FlashList<T>["scrollToOffset"];
  scrollToEnd: FlashList<T>["scrollToEnd"];
  getScrollableNode: FlashList<T>["getScrollableNode"];
}

export const MasonryFlashList = React.forwardRef(
  <T,>(
    props: MasonryFlashListProps<T>,
    ref: React.ForwardedRef<MasonryFlashListRef<T>>
  ) => {
    const columnCount = props.numColumns || 1;
    const drawDistance =
      props.drawDistance ?? PlatformConfig.defaultMasonryDrawDistance;
    const estimatedListSize = props.estimatedListSize ??
      Dimensions.get("window") ?? { height: 500, width: 500 };

    const dataSet = useDataSet(columnCount, props.data);

    const onScrollRef = useRef<OnScrollCallback[]>([]);
    const scrollEventObject = useRef({
      nativeEvent: { contentOffset: { y: 0, x: 0 } },
    }).current as NativeSyntheticEvent<NativeScrollEvent>;
    const ScrollComponent = useRef(
      getFlashListScrollView(onScrollRef, estimatedListSize.height)
    ).current;

    const onScrollProxy = useRef<OnScrollCallback>(
      (scrollEvent: NativeSyntheticEvent<NativeScrollEvent>) => {
        onScrollRef.current?.forEach((onScrollCallback) => {
          scrollEventObject.nativeEvent.contentOffset.y =
            scrollEvent.nativeEvent.contentOffset.y -
            (parentFlashList.current?.firstItemOffset ?? 0);
          scrollEventObject.nativeEvent.contentOffset.x =
            scrollEvent.nativeEvent.contentOffset.x;
          onScrollCallback?.(scrollEventObject);
        });
        props.onScroll?.(scrollEvent);
      }
    ).current;

    const parentFlashList = useRef<FlashList<T[]>>(null);

    useEffect(() => {}, []);

    return (
      <FlashList
        ref={parentFlashList}
        numColumns={columnCount}
        data={dataSet}
        onScroll={onScrollProxy}
        contentContainerStyle={props.contentContainerStyle}
        ListFooterComponent={props.ListFooterComponent}
        ListHeaderComponent={props.ListHeaderComponent}
        ListEmptyComponent={props.ListEmptyComponent}
        ListFooterComponentStyle={props.ListFooterComponentStyle}
        ListHeaderComponentStyle={props.ListHeaderComponentStyle}
        estimatedItemSize={estimatedListSize.height}
        estimatedListSize={props.estimatedListSize}
        extraData={props.extraData}
        onEndReached={props.onEndReached}
        onEndReachedThreshold={props.onEndReachedThreshold}
        renderItem={(args) => {
          return (
            <FlashList
              renderScrollComponent={ScrollComponent}
              estimatedItemSize={props.estimatedItemSize}
              data={args.item}
              renderItem={(innerArgs) => {
                return (
                  props.renderItem?.({
                    ...innerArgs,
                    index: getActualIndex(
                      innerArgs.index,
                      args.index,
                      columnCount
                    ),
                  }) ?? null
                );
              }}
              drawDistance={drawDistance}
              estimatedListSize={{
                height: estimatedListSize.height,
                width: estimatedListSize.width / columnCount,
              }}
              extraData={props.extraData}
              viewabilityConfig={props.viewabilityConfig}
              onViewableItemsChanged={
                props.onViewableItemsChanged
                  ? (info) => {
                      updateViewToken(
                        info.viewableItems,
                        args.index,
                        columnCount
                      );
                      updateViewToken(info.changed, args.index, columnCount);
                      props.onViewableItemsChanged?.(info);
                    }
                  : undefined
              }
            />
          );
        }}
      />
    );
  }
);

const useDataSet = <T,>(
  columnCount: number,
  sourceData?: FlashListProps<T>["data"]
) => {
  return useMemo(() => {
    const data = sourceData ?? [];
    return data.length > 0
      ? new Array(columnCount).fill(null).map((_, pIndex) => {
          return data?.filter((__, index) => index % columnCount === pIndex);
        })
      : data;
  }, [sourceData, columnCount]) as T[][];
};

const getFlashListScrollView = (
  onScrollRef: React.RefObject<OnScrollCallback[]>,
  estimatedHeight: number
) => {
  const FlashListScrollView = React.forwardRef(
    (props: ScrollViewProps, ref: React.ForwardedRef<View>) => {
      const { onLayout, onScroll, ...rest } = props;
      const onLayoutProxy = useCallback(
        (layoutEvent) => {
          onLayout?.({
            nativeEvent: {
              layout: {
                height: estimatedHeight,
                width: layoutEvent.nativeEvent.layout.width,
              },
            },
          } as LayoutChangeEvent);
        },
        [onLayout]
      );
      useEffect(() => {
        onScrollRef.current?.push(onScroll);
        return () => {
          if (!onScrollRef.current) {
            return;
          }
          const indexToDelete = onScrollRef.current.indexOf(onScroll);
          if (indexToDelete > -1) {
            onScrollRef.current.splice(indexToDelete, 1);
          }
        };
      });
      return <View ref={ref} {...rest} onLayout={onLayoutProxy} />;
    }
  );
  FlashListScrollView.displayName = "FlashListScrollView";
  return FlashListScrollView;
};
const updateViewToken = (
  tokens: ViewToken[],
  column: number,
  columnCount: number
) => {
  const length = tokens.length;
  for (let i = 0; i < length; i++) {
    const token = tokens[i];
    if (token.index !== null && token.index !== undefined) {
      token.index = getActualIndex(token.index, column, columnCount);
    }
  }
};
const getActualIndex = (row: number, column: number, columnCount: number) => {
  return row * columnCount + column;
};
MasonryFlashList.displayName = "MasonryFlashList";
