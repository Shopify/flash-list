import React, {
  RefObject,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  I18nManager,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
} from "react-native";

import { RVDimension } from "./layout-managers/LayoutManager";
import { areDimensionsNotEqual, measureLayout } from "./utils/measureLayout";
import { RecyclerViewContextProvider } from "./RecyclerViewContextProvider";
import { useLayoutState } from "./hooks/useLayoutState";
import { useRecyclerViewManager } from "./hooks/useRecyclerViewManager";
import { RecyclerViewProps } from "./RecyclerViewProps";
import { useOnListLoad } from "./hooks/useOnLoad";
import {
  ViewHolderCollection,
  ViewHolderCollectionRef,
} from "./ViewHolderCollection";
import { useContentOffsetManagement } from "./hooks/useContentOffsetManagement";
import { getValidComponent } from "./utils/componentUtils";
import { CompatView } from "./components/CompatView";
import { CompatScroller } from "./components/CompatScroller";

export interface ScrollToOffsetParams {
  // The offset to scroll to
  offset: number;
  // Whether the scrolling should be animated
  animated?: boolean;
  // Optional: position of the view to scroll to
  viewPosition?: number;
  // Optional: size of the view
  viewSize?: number;
}

const RecyclerViewComponent = <T1,>(
  props: RecyclerViewProps<T1>,
  ref: React.Ref<any>
) => {
  const {
    horizontal,
    renderItem,
    data,
    extraData,
    onLoad,
    CellRendererComponent,
    overrideProps,
    refreshing,
    onRefresh,
    progressViewOffset,
    ListEmptyComponent,
    ListHeaderComponent,
    ListHeaderComponentStyle,
    ListFooterComponent,
    ListFooterComponentStyle,
    ...rest
  } = props;
  const scrollViewRef = useRef<CompatScroller>(null);
  const internalViewRef = useRef<CompatView>(null);
  const childContainerViewRef = useRef<CompatView>(null);
  const distanceFromWindow = useRef(0);
  const [_, setRenderId] = useLayoutState(0);

  const refHolder = useMemo(
    () => new Map<number, RefObject<CompatView | null>>(),
    []
  );

  const { recyclerViewManager, renderStack } = useRecyclerViewManager(props);
  const { contentOffset, handleCommitLayoutEffect } =
    useContentOffsetManagement(recyclerViewManager, props);
  // console.log("contentOffset", contentOffset);
  //console.log("render stack", renderStack);
  const viewHolderCollectionRef = useRef<ViewHolderCollectionRef>(null);

  useOnListLoad(recyclerViewManager, onLoad);

  // layoutManager?.updateLayoutParams({
  //   overrideItemLayout: (index, layout) => {
  //     props.overrideItemLayout?.(layout, data![index], index, numColumns ?? 1);
  //   },
  //   horizontal,
  //   maxColumns: numColumns,
  //   windowSize: recycleManager.getWindowSize(),
  // });

  // Initialization effect
  useLayoutEffect(() => {
    if (internalViewRef.current && childContainerViewRef.current) {
      const outerViewLayout = measureLayout(internalViewRef.current);
      const childViewLayout = measureLayout(childContainerViewRef.current);
      distanceFromWindow.current = horizontal
        ? childViewLayout.x - outerViewLayout.x
        : childViewLayout.y - outerViewLayout.y;

      recyclerViewManager.updateWindowSize({
        width: outerViewLayout.width,
        height: outerViewLayout.height,
      });
    }
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const layoutInfo = Array.from(refHolder, ([index, viewHolderRef]) => {
      const layout = measureLayout(viewHolderRef.current!);
      return { index, dimensions: layout };
    });
    console.log("render effect");
    if (
      recyclerViewManager.modifyChildrenLayout(layoutInfo, data?.length ?? 0)
    ) {
      context.layout();
    } else {
      // TODO: reduce perf impact of commitLayout
      viewHolderCollectionRef.current?.commitLayout();
    }
  });

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      let scrollOffset = horizontal
        ? event.nativeEvent.contentOffset.x
        : event.nativeEvent.contentOffset.y;
      if (I18nManager.isRTL && horizontal) {
        scrollOffset =
          event.nativeEvent.contentSize.width -
          scrollOffset -
          2 * event.nativeEvent.layoutMeasurement.width +
          distanceFromWindow.current;
        // TODO: not rounding off is leading to repeated onScroll events, precision issue
        scrollOffset = Math.ceil(scrollOffset);
        console.log("RTL", scrollOffset, distanceFromWindow.current);
      } else {
        scrollOffset -= distanceFromWindow.current;
      }
      recyclerViewManager.updateScrollOffset(
        scrollOffset,
        event.nativeEvent.velocity
      );
    },
    [horizontal, recyclerViewManager]
  );

  // Expose scrollToOffset method to parent component
  useImperativeHandle(ref, () => ({
    props,
    scrollToOffset: ({ offset, animated }: ScrollToOffsetParams) => {
      if (scrollViewRef.current) {
        const scrollTo = horizontal ? { x: offset, y: 0 } : { x: 0, y: offset };
        scrollViewRef.current.scrollTo({
          ...scrollTo,
          animated,
        });

        // Optionally handle viewPosition and viewSize if needed
        // This is a simple implementation and may require more logic depending on your needs
      }
    },
  }));

  // const contentOffset = useContentOffsetManagement(recyclerViewManager);

  const context = useMemo(() => {
    return {
      layout: () => {
        setRenderId((prev) => prev + 1);
      },
      validateItemSize: (index: number, size: RVDimension) => {
        const layout = recyclerViewManager.getLayout(index);
        const width = Math.max(
          Math.min(layout.width, layout.maxWidth ?? Infinity),
          layout.minWidth ?? 0
        );
        const height = Math.max(
          Math.min(layout.height, layout.maxHeight ?? Infinity),
          layout.minHeight ?? 0
        );
        if (
          areDimensionsNotEqual(width, size.width) ||
          areDimensionsNotEqual(height, size.height)
        ) {
          console.log(
            "invalid size",
            index,
            width,
            size.width,
            height,
            size.height
          );
          // TODO: Add a warning for missing useLayoutState
          //context.layout();
        }
      },
    };
  }, [recyclerViewManager, setRenderId]);

  // Create a function to get the refresh control
  const refreshControl = useMemo(() => {
    if (onRefresh) {
      return (
        <RefreshControl
          refreshing={Boolean(refreshing)}
          progressViewOffset={progressViewOffset}
          onRefresh={onRefresh}
        />
      );
    }
    return undefined;
  }, [onRefresh, refreshing, progressViewOffset]);

  const renderHeader = useMemo(() => {
    if (!ListHeaderComponent) {
      return null;
    }
    return (
      <CompatView style={ListHeaderComponentStyle}>
        {getValidComponent(ListHeaderComponent)}
      </CompatView>
    );
  }, [ListHeaderComponent, ListHeaderComponentStyle]);

  const renderFooter = useMemo(() => {
    if (!ListFooterComponent) {
      return null;
    }
    return (
      <CompatView style={ListFooterComponentStyle}>
        {getValidComponent(ListFooterComponent)}
      </CompatView>
    );
  }, [ListFooterComponent, ListFooterComponentStyle]);

  const renderEmpty = useMemo(() => {
    if (!ListEmptyComponent || (data && data.length > 0)) {
      return null;
    }
    return getValidComponent(ListEmptyComponent);
  }, [ListEmptyComponent, data]);

  return (
    <RecyclerViewContextProvider value={context}>
      <CompatView
        style={{ flex: horizontal ? undefined : 1 }}
        ref={internalViewRef}
        onLayout={() => {
          //context.layout();
        }}
      >
        <CompatScroller
          {...rest}
          horizontal={horizontal}
          ref={scrollViewRef}
          contentOffset={contentOffset}
          onScroll={onScroll}
          // TODO: evaluate perf
          removeClippedSubviews={false}
          refreshControl={refreshControl}
          {...overrideProps}
        >
          {renderHeader}
          <ViewHolderCollection
            viewHolderCollectionRef={viewHolderCollectionRef}
            data={data}
            renderStack={renderStack}
            getLayout={(index) => recyclerViewManager.getLayout(index)}
            refHolder={refHolder}
            onSizeChanged={context.validateItemSize}
            renderItem={renderItem}
            extraData={extraData}
            childContainerViewRef={childContainerViewRef}
            onCommitLayoutEffect={handleCommitLayoutEffect}
            CellRendererComponent={CellRendererComponent}
            getChildContainerLayout={() =>
              recyclerViewManager.hasLayout()
                ? recyclerViewManager.getChildContainerLayout()
                : undefined
            }
          />
          {renderEmpty}
          {renderFooter}
        </CompatScroller>
      </CompatView>
    </RecyclerViewContextProvider>
  );
};

export const RecyclerView = forwardRef(
  RecyclerViewComponent
) as typeof RecyclerViewComponent;

// RecyclerView.displayName = "RecyclerView";
