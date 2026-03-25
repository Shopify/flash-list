/**
 * NativeRecyclerView — JS orchestration layer for native-backed FlashList.
 *
 * This component wraps the native FlashListRecyclerView (RecyclerView on Android,
 * UICollectionView on iOS) and bridges JS rendering with native recycling.
 *
 * Architecture:
 * 1. Native side owns: scrolling, recycling, layout positioning
 * 2. JS side owns: renderItem content, viewability tracking, prop processing
 * 3. Bridge: Native requests cells via onCellRenderRequest → JS renders → Fabric mounts into ViewHolder
 */
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, StyleSheet, findNodeHandle } from "react-native";

import type {
  FlashListRef,
  ScrollToIndexParams,
  ScrollToOffsetParams,
  ScrollToEdgeParams,
  ScrollToItemParams,
} from "../FlashListRef";
import type { FlashListProps } from "../FlashListProps";
import { RenderTargetOptions } from "../FlashListProps";
import NativeFlashListView from "../native/NativeFlashListViewNativeComponent";
import { Commands } from "../native/NativeFlashListCommands";
import type { RecyclerViewProps } from "./RecyclerViewProps";

/**
 * Tracks which cell keys are mapped to which data indices.
 */
interface CellMapping {
  cellKey: number;
  index: number;
  viewType: number;
}

const NativeRecyclerViewComponent = <T,>(
  props: FlashListProps<T>,
  ref: React.Ref<FlashListRef<T>>
) => {
  const {
    data,
    renderItem,
    keyExtractor,
    numColumns = 1,
    horizontal,
    inverted,
    masonry = false,
    drawDistance = 250,
    extraData,
    onScroll,
    onScrollBeginDrag,
    onScrollEndDrag,
    onMomentumScrollBegin,
    onMomentumScrollEnd,
    onEndReached,
    onEndReachedThreshold = 0.5,
    onRefresh,
    refreshing,
    ListHeaderComponent,
    ListHeaderComponentStyle,
    ListFooterComponent,
    ListFooterComponentStyle,
    ListEmptyComponent,
    ListEmptyComponentStyle,
    ItemSeparatorComponent,
    CellRendererComponent,
    scrollEnabled = true,
    showsVerticalScrollIndicator = true,
    showsHorizontalScrollIndicator = true,
    pagingEnabled,
    nestedScrollEnabled,
    scrollEventThrottle = 16,
    style,
  } = props;

  const nativeRef = useRef<React.ElementRef<typeof NativeFlashListView>>(null);

  // Cell registry: tracks which ViewHolder cells are active and what they render
  const [cellMappings, setCellMappings] = useState<Map<number, CellMapping>>(
    new Map()
  );

  const dataLength = data?.length ?? 0;
  const isHorizontal = horizontal === true;
  const isInverted = inverted === true;
  const isRefreshing = refreshing === true;

  // Handle native cell render request
  const handleCellRenderRequest = useCallback((event: any) => {
    const { cellKey, index, viewType } = event.nativeEvent;
    setCellMappings((prev) => {
      const next = new Map(prev);
      next.set(cellKey, { cellKey, index, viewType });
      return next;
    });
  }, []);

  // Handle scroll events
  const handleScroll = useCallback(
    (event: any) => {
      onScroll?.(event);

      // Check for onEndReached
      if (onEndReached && data) {
        const { contentOffset, contentSize, layoutMeasurement } =
          event.nativeEvent;
        const offset = isHorizontal ? contentOffset.x : contentOffset.y;
        const contentLength = isHorizontal
          ? contentSize.width
          : contentSize.height;
        const visibleLength = isHorizontal
          ? layoutMeasurement.width
          : layoutMeasurement.height;
        const distanceFromEnd = contentLength - offset - visibleLength;
        const threshold = (onEndReachedThreshold ?? 0.5) * visibleLength;

        if (distanceFromEnd <= threshold) {
          onEndReached();
        }
      }
    },
    [onScroll, onEndReached, onEndReachedThreshold, isHorizontal, data]
  );

  // Imperative API
  useImperativeHandle(ref, () => ({
    props: props as unknown as RecyclerViewProps<T>,

    scrollToIndex: async (params: ScrollToIndexParams) => {
      if (nativeRef.current) {
        Commands.scrollToIndex(
          nativeRef.current,
          params.index,
          params.animated ?? true,
          params.viewPosition ?? 0,
          params.viewOffset ?? 0
        );
      }
    },
    scrollToOffset: (params: ScrollToOffsetParams) => {
      if (nativeRef.current) {
        Commands.scrollToOffset(
          nativeRef.current,
          params.offset,
          params.animated ?? true
        );
      }
    },
    scrollToEnd: (params?: ScrollToEdgeParams) => {
      if (nativeRef.current) {
        Commands.scrollToEnd(nativeRef.current, params?.animated ?? true);
      }
    },
    scrollToTop: (params?: ScrollToEdgeParams) => {
      if (nativeRef.current) {
        Commands.scrollToOffset(
          nativeRef.current,
          0,
          params?.animated ?? true
        );
      }
    },
    scrollToItem: (params: ScrollToItemParams<T>) => {
      if (data && params.item) {
        const index = data.indexOf(params.item);
        if (index >= 0 && nativeRef.current) {
          Commands.scrollToIndex(
            nativeRef.current,
            index,
            params.animated ?? true,
            params.viewPosition ?? 0,
            0
          );
        }
      }
    },
    flashScrollIndicators: () => {
      if (nativeRef.current) {
        Commands.flashScrollIndicators(nativeRef.current);
      }
    },
    getNativeScrollRef: () => {
      return nativeRef.current as any;
    },
    getScrollResponder: () => {
      return nativeRef.current as any;
    },
    getScrollableNode: () => {
      return nativeRef.current ? findNodeHandle(nativeRef.current) : null;
    },
    getFirstItemOffset: () => 0,
    getWindowSize: () => ({ width: 0, height: 0 }),
    getLayout: () => undefined,
    getAbsoluteLastScrollOffset: () => 0,
    getChildContainerDimensions: () => ({ width: 0, height: 0 }),
    recordInteraction: () => {},
    computeVisibleIndices: () => ({ startIndex: 0, endIndex: 0 }),
    getFirstVisibleIndex: () => 0,
    recomputeViewableItems: () => {},
    prepareForLayoutAnimationRender: () => {},
    clearLayoutCacheOnUpdate: () => {},
  }));

  // Render cells that native has requested
  const renderedCells = useMemo(() => {
    if (!renderItem || !data) return null;

    const cells: React.ReactElement[] = [];
    cellMappings.forEach((mapping) => {
      if (mapping.index >= 0 && mapping.index < data.length) {
        const item = data[mapping.index];
        const key = keyExtractor
          ? keyExtractor(item, mapping.index)
          : String(mapping.index);

        const element = renderItem({
          item,
          index: mapping.index,
          target: RenderTargetOptions.Cell,
          extraData,
        });

        if (element) {
          const cell = (
            <View key={key} nativeID={`cell-${mapping.cellKey}`}>
              {CellRendererComponent ? (
                <CellRendererComponent index={mapping.index}>
                  {element}
                  {ItemSeparatorComponent &&
                    mapping.index < data.length - 1 &&
                    React.createElement(ItemSeparatorComponent)}
                </CellRendererComponent>
              ) : (
                <>
                  {element}
                  {ItemSeparatorComponent &&
                    mapping.index < data.length - 1 &&
                    React.createElement(ItemSeparatorComponent)}
                </>
              )}
            </View>
          );
          cells.push(cell);
        }
      }
    });
    return cells;
  }, [
    cellMappings,
    data,
    renderItem,
    keyExtractor,
    extraData,
    CellRendererComponent,
    ItemSeparatorComponent,
  ]);

  // Render header component
  const headerElement = useMemo(() => {
    if (!ListHeaderComponent) return null;
    const header = React.isValidElement(ListHeaderComponent) ? (
      ListHeaderComponent
    ) : (
      // @ts-expect-error component type
      <ListHeaderComponent />
    );
    return (
      <View style={ListHeaderComponentStyle} nativeID="flash-list-header">
        {header}
      </View>
    );
  }, [ListHeaderComponent, ListHeaderComponentStyle]);

  // Render footer component
  const footerElement = useMemo(() => {
    if (!ListFooterComponent) return null;
    const footer = React.isValidElement(ListFooterComponent) ? (
      ListFooterComponent
    ) : (
      // @ts-expect-error component type
      <ListFooterComponent />
    );
    return (
      <View style={ListFooterComponentStyle} nativeID="flash-list-footer">
        {footer}
      </View>
    );
  }, [ListFooterComponent, ListFooterComponentStyle]);

  // Render empty component
  const emptyElement = useMemo(() => {
    if (dataLength > 0 || !ListEmptyComponent) return null;
    const empty = React.isValidElement(ListEmptyComponent) ? (
      ListEmptyComponent
    ) : (
      // @ts-expect-error component type
      <ListEmptyComponent />
    );
    return (
      <View style={ListEmptyComponentStyle} nativeID="flash-list-empty">
        {empty}
      </View>
    );
  }, [dataLength, ListEmptyComponent, ListEmptyComponentStyle]);

  return (
    <View style={[styles.container, style]}>
      {headerElement}
      {dataLength === 0 && emptyElement}
      {dataLength > 0 && (
        <NativeFlashListView
          ref={nativeRef}
          style={styles.recyclerView}
          dataLength={dataLength}
          numColumns={numColumns}
          horizontal={isHorizontal}
          inverted={isInverted}
          masonry={masonry}
          drawDistance={drawDistance}
          scrollEnabled={scrollEnabled}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
          pagingEnabled={pagingEnabled ?? false}
          nestedScrollEnabled={nestedScrollEnabled ?? false}
          scrollEventThrottle={scrollEventThrottle}
          refreshing={isRefreshing}
          refreshEnabled={!!onRefresh}
          onScroll={handleScroll}
          onScrollBeginDrag={onScrollBeginDrag as any}
          onScrollEndDrag={onScrollEndDrag as any}
          onMomentumScrollBegin={onMomentumScrollBegin as any}
          onMomentumScrollEnd={onMomentumScrollEnd as any}
          onCellRenderRequest={handleCellRenderRequest}
          onRefresh={onRefresh ? () => onRefresh() : undefined}
        >
          {renderedCells}
        </NativeFlashListView>
      )}
      {footerElement}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  recyclerView: {
    flex: 1,
  },
});

export const NativeRecyclerView = forwardRef(NativeRecyclerViewComponent) as <
  T,
>(
  props: FlashListProps<T> & { ref?: React.Ref<FlashListRef<T>> }
) => React.ReactElement;
