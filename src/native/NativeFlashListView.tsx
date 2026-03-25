/**
 * NativeFlashListView - JS orchestration layer for native-backed recycling.
 *
 * This component:
 * 1. Wraps the native RecyclerView/UICollectionView component
 * 2. Maps all FlashList props to native props
 * 3. Handles item rendering via React (items are JS-rendered, native-positioned)
 * 4. Manages the render request/response protocol with native
 * 5. Provides all imperative methods via ref
 *
 * Architecture:
 * - Native side owns the scroll container and recycling
 * - JS side owns item rendering via renderItem
 * - Communication is bidirectional:
 *   - JS -> Native: props, commands (scrollToIndex, etc.)
 *   - Native -> JS: events (onScroll, onRenderRequest, onViewableItemsChanged)
 */
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  findNodeHandle,
  UIManager,
  View,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import type { FlashListProps } from "../FlashListProps";
import type { FlashListRef, ScrollToIndexParams } from "../FlashListRef";
import type { RVLayout } from "../recyclerview/layout-managers/LayoutManager";
import NativeFlashListViewComponent from "./NativeFlashListViewNativeComponent";
import type {
  NativeRenderRequestData,
  NativeScrollEventData,
  NativeViewableItemsChangedData,
} from "./NativeFlashListViewNativeComponent";

/**
 * Sends a command to the native component
 */
function dispatchCommand(
  ref: React.RefObject<any>,
  command: string,
  args: any[]
) {
  const handle = findNodeHandle(ref.current);
  if (handle != null) {
    UIManager.dispatchViewManagerCommand(handle, command, args);
  }
}

const NativeFlashListViewComponent2 = <T,>(
  props: FlashListProps<T>,
  ref: React.Ref<FlashListRef<T>>
) => {
  const {
    data,
    renderItem,
    keyExtractor,
    getItemType,
    overrideItemLayout,
    numColumns = 1,
    horizontal = false,
    inverted = false,
    masonry = false,
    drawDistance,
    extraData,
    onEndReached,
    onEndReachedThreshold,
    onStartReached,
    onStartReachedThreshold,
    onScroll,
    onRefresh,
    refreshing,
    progressViewOffset,
    onViewableItemsChanged,
    onLoad,
    scrollEnabled,
    showsVerticalScrollIndicator,
    showsHorizontalScrollIndicator,
    bounces,
    pagingEnabled,
    snapToInterval,
    snapToAlignment,
    decelerationRate,
    nestedScrollEnabled,
    keyboardDismissMode,
    ListHeaderComponent,
    ListHeaderComponentStyle,
    ListFooterComponent,
    ListFooterComponentStyle,
    ListEmptyComponent,
    ListEmptyComponentStyle,
    ItemSeparatorComponent,
    CellRendererComponent,
    stickyHeaderIndices,
    maintainVisibleContentPosition,
    style,
  } = props;

  const nativeRef = useRef<any>(null);
  const [renderedIndices, setRenderedIndices] = useState<Set<number>>(
    new Set()
  );
  const [loadTime] = useState(() => Date.now());
  const hasReportedLoad = useRef(false);

  const itemCount = data?.length ?? 0;

  // Build item type map for native
  const itemTypes = useMemo(() => {
    if (!data || !getItemType) return undefined;
    const types: Record<string, string> = {};
    for (let i = 0; i < data.length; i++) {
      const type = getItemType(data[i], i, extraData);
      if (type !== undefined) {
        types[i.toString()] = type.toString();
      }
    }
    return types;
  }, [data, getItemType, extraData]);

  // Build item key map for native
  const itemKeys = useMemo(() => {
    if (!data) return undefined;
    const keys: Record<string, string> = {};
    for (let i = 0; i < data.length; i++) {
      const key = keyExtractor
        ? keyExtractor(data[i], i)
        : i.toString();
      keys[i.toString()] = key;
    }
    return keys;
  }, [data, keyExtractor]);

  // Build span sizes for native (grid layout)
  const spanSizes = useMemo(() => {
    if (!data || !overrideItemLayout || numColumns <= 1) return undefined;
    const spans: Record<string, number> = {};
    for (let i = 0; i < data.length; i++) {
      const layout: { span?: number } = {};
      overrideItemLayout(layout, data[i], i, numColumns, extraData);
      if (layout.span && layout.span > 1) {
        spans[i.toString()] = layout.span;
      }
    }
    return Object.keys(spans).length > 0 ? spans : undefined;
  }, [data, overrideItemLayout, numColumns, extraData]);

  // Determine initial render set - render first screenful of items
  useEffect(() => {
    if (!data || data.length === 0) return;
    const initialCount = Math.min(data.length, 20); // Initial batch
    const indices = new Set<number>();
    for (let i = 0; i < initialCount; i++) {
      indices.add(i);
    }
    setRenderedIndices(indices);
  }, [data]);

  // Handle render requests from native
  const handleRenderRequest = useCallback(
    (event: NativeSyntheticEvent<NativeRenderRequestData>) => {
      const { indices } = event.nativeEvent;
      setRenderedIndices((prev) => {
        const next = new Set(prev);
        for (const idx of indices) {
          next.add(idx);
        }
        return next;
      });
    },
    []
  );

  // Handle scroll events
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEventData>) => {
      // Forward to user's onScroll
      onScroll?.(event as any);
    },
    [onScroll]
  );

  // Handle end reached
  const handleEndReached = useCallback(() => {
    onEndReached?.();
  }, [onEndReached]);

  // Handle start reached
  const handleStartReached = useCallback(() => {
    onStartReached?.();
  }, [onStartReached]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    onRefresh?.();
  }, [onRefresh]);

  // Handle viewable items changed
  const handleViewableItemsChanged = useCallback(
    (event: NativeSyntheticEvent<NativeViewableItemsChangedData>) => {
      if (!onViewableItemsChanged || !data) return;
      const { viewableItems, changed } = event.nativeEvent;
      onViewableItemsChanged({
        viewableItems: viewableItems.map((item) => ({
          item: data[item.index],
          key: item.key,
          index: item.index,
          isViewable: item.isViewable,
          timestamp: Date.now(),
        })),
        changed: changed.map((item) => ({
          item: data[item.index],
          key: item.key,
          index: item.index,
          isViewable: item.isViewable,
          timestamp: Date.now(),
        })),
      });
    },
    [onViewableItemsChanged, data]
  );

  // Report load time
  useEffect(() => {
    if (
      !hasReportedLoad.current &&
      renderedIndices.size > 0 &&
      onLoad
    ) {
      hasReportedLoad.current = true;
      const elapsed = Date.now() - loadTime;
      onLoad({ elapsedTimeInMs: elapsed });
    }
  }, [renderedIndices.size, onLoad, loadTime]);

  // Imperative handle
  useImperativeHandle(
    ref,
    () => ({
      props: props,
      scrollToOffset: (params) => {
        dispatchCommand(nativeRef, "scrollToOffset", [
          params.offset,
          params.animated ?? false,
        ]);
      },
      scrollToIndex: async (params: ScrollToIndexParams) => {
        dispatchCommand(nativeRef, "scrollToIndex", [
          params.index,
          params.animated ?? false,
          params.viewPosition ?? 0,
          params.viewOffset ?? 0,
        ]);
      },
      scrollToItem: (params) => {
        if (!data) return;
        const index = data.indexOf(params.item);
        if (index >= 0) {
          dispatchCommand(nativeRef, "scrollToIndex", [
            index,
            params.animated ?? false,
            params.viewPosition ?? 0,
            params.viewOffset ?? 0,
          ]);
        }
      },
      scrollToEnd: (params) => {
        dispatchCommand(nativeRef, "scrollToEnd", [
          params?.animated ?? false,
        ]);
      },
      scrollToTop: (params) => {
        dispatchCommand(nativeRef, "scrollToTop", [
          params?.animated ?? false,
        ]);
      },
      flashScrollIndicators: () => {
        dispatchCommand(nativeRef, "flashScrollIndicators", []);
      },
      getNativeScrollRef: () => nativeRef.current,
      getScrollResponder: () => nativeRef.current,
      getScrollableNode: () => findNodeHandle(nativeRef.current),
      getFirstItemOffset: () => 0,
      getWindowSize: () => ({ width: 0, height: 0 }),
      getLayout: (_index: number): RVLayout | undefined => undefined,
      getAbsoluteLastScrollOffset: () => 0,
      getChildContainerDimensions: () => ({ width: 0, height: 0 }),
      recordInteraction: () => {},
      computeVisibleIndices: () => ({ startIndex: 0, endIndex: 0 }),
      getFirstVisibleIndex: () => 0,
      recomputeViewableItems: () => {},
      prepareForLayoutAnimationRender: () => {},
      clearLayoutCacheOnUpdate: () => {},
    }),
    [props, data]
  );

  // Render items
  const renderedItems = useMemo(() => {
    if (!data || !renderItem) return null;

    const items: React.ReactElement[] = [];
    const sortedIndices = Array.from(renderedIndices).sort((a, b) => a - b);

    for (const index of sortedIndices) {
      if (index >= data.length) continue;

      const item = data[index];
      const key = keyExtractor
        ? keyExtractor(item, index)
        : index.toString();

      const rendered = renderItem({
        item,
        index,
        target: "Cell",
        extraData,
      });

      if (rendered) {
        const separator =
          ItemSeparatorComponent && index < data.length - 1 ? (
            <ItemSeparatorComponent />
          ) : null;

        const cellContent = (
          <View key={key} style={{ flexDirection: horizontal ? "row" : "column" }}>
            {rendered}
            {separator}
          </View>
        );

        if (CellRendererComponent) {
          items.push(
            <CellRendererComponent key={key} index={index} style={{}}>
              {cellContent}
            </CellRendererComponent>
          );
        } else {
          items.push(cellContent);
        }
      }
    }

    return items;
  }, [
    data,
    renderItem,
    renderedIndices,
    keyExtractor,
    extraData,
    horizontal,
    ItemSeparatorComponent,
    CellRendererComponent,
  ]);

  // Render header
  const header = useMemo(() => {
    if (!ListHeaderComponent) return null;
    const component =
      typeof ListHeaderComponent === "function" ? (
        <ListHeaderComponent />
      ) : (
        ListHeaderComponent
      );
    return <View style={ListHeaderComponentStyle}>{component}</View>;
  }, [ListHeaderComponent, ListHeaderComponentStyle]);

  // Render footer
  const footer = useMemo(() => {
    if (!ListFooterComponent) return null;
    const component =
      typeof ListFooterComponent === "function" ? (
        <ListFooterComponent />
      ) : (
        ListFooterComponent
      );
    return <View style={ListFooterComponentStyle}>{component}</View>;
  }, [ListFooterComponent, ListFooterComponentStyle]);

  // Render empty
  const empty = useMemo(() => {
    if (!ListEmptyComponent || (data && data.length > 0)) return null;
    const component =
      typeof ListEmptyComponent === "function" ? (
        <ListEmptyComponent />
      ) : (
        ListEmptyComponent
      );
    return <View style={ListEmptyComponentStyle}>{component}</View>;
  }, [ListEmptyComponent, ListEmptyComponentStyle, data]);

  const containerStyle: StyleProp<ViewStyle> = useMemo(() => {
    return [{ flex: horizontal ? undefined : 1 }, style];
  }, [horizontal, style]);

  return (
    <View style={containerStyle}>
      <NativeFlashListViewComponent
        ref={nativeRef}
        style={{ flex: 1, flexDirection: horizontal ? "row" : "column" }}
        horizontal={horizontal ?? undefined}
        inverted={inverted ?? undefined}
        numColumns={numColumns}
        masonry={masonry}
        itemCount={itemCount}
        drawDistance={drawDistance}
        scrollEnabled={scrollEnabled ?? undefined}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator ?? undefined}
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator ?? undefined}
        bounces={bounces ?? undefined}
        pagingEnabled={pagingEnabled ?? undefined}
        snapToInterval={snapToInterval ?? undefined}
        snapToAlignment={snapToAlignment ?? undefined}
        decelerationRate={
          typeof decelerationRate === "string"
            ? decelerationRate === "fast"
              ? 0.99
              : 0.998
            : (decelerationRate ?? undefined)
        }
        nestedScrollEnabled={nestedScrollEnabled ?? undefined}
        keyboardDismissMode={keyboardDismissMode}
        onEndReachedThreshold={onEndReachedThreshold ?? undefined}
        onStartReachedThreshold={onStartReachedThreshold ?? undefined}
        refreshing={refreshing ?? undefined}
        onRefreshEnabled={!!onRefresh}
        progressViewOffset={progressViewOffset}
        itemTypes={itemTypes}
        itemKeys={itemKeys}
        spanSizes={spanSizes}
        stickyHeaderIndices={stickyHeaderIndices}
        maintainVisibleContentPosition={maintainVisibleContentPosition}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onEndReached={handleEndReached as any}
        onStartReached={handleStartReached as any}
        onRefresh={handleRefresh as any}
        onRenderRequest={handleRenderRequest}
        onViewableItemsChanged={handleViewableItemsChanged}
      >
        {header}
        {renderedItems}
        {empty}
        {footer}
      </NativeFlashListViewComponent>
    </View>
  );
};

const NativeFlashListView = React.memo(
  forwardRef(NativeFlashListViewComponent2)
) as <T>(
  props: FlashListProps<T> & { ref?: React.Ref<FlashListRef<T>> }
) => React.JSX.Element;

export { NativeFlashListView };
