import React, {
  RefObject,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  forwardRef,
  useState,
} from "react";
import {
  I18nManager,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
} from "react-native";

import { RVDimension } from "./layout-managers/LayoutManager";
import {
  areDimensionsNotEqual,
  measureLayout,
  measureLayoutRelative,
} from "./utils/measureLayout";
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
import { useBoundDetection } from "./hooks/useBoundDetection";
import { useRecyclerViewHandler } from "./hooks/useRecyclerViewHandler";
import { adjustOffsetForRTL } from "./utils/adjustOffsetForRTL";
import { useSecondaryProps } from "./hooks/useSecondaryProps";

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
    ItemSeparatorComponent,
    renderScrollComponent,
    onScroll,
    disableRecycling,
    ...rest
  } = props;
  const scrollViewRef = useRef<CompatScroller>(null);
  const internalViewRef = useRef<CompatView>(null);
  const childContainerViewRef = useRef<CompatView>(null);
  const distanceFromWindow = useRef(0);
  const [_, setLayoutTreeId] = useLayoutState(0);
  const [__, setRenderId] = useState(0);

  const refHolder = useMemo(
    () => new Map<number, RefObject<CompatView | null>>(),
    []
  );

  const { recyclerViewManager } = useRecyclerViewManager(props);
  const { contentOffset, applyContentOffset } = useContentOffsetManagement(
    recyclerViewManager,
    props
  );
  // console.log("contentOffset", contentOffset);
  //console.log("render stack", renderStack);
  const viewHolderCollectionRef = useRef<ViewHolderCollectionRef>(null);

  useOnListLoad(recyclerViewManager, onLoad);

  // Use the bound detection hook
  const { checkBounds } = useBoundDetection(recyclerViewManager, props);

  // Use the recycler view handler hook to handle imperative methods
  useRecyclerViewHandler(recyclerViewManager, ref, scrollViewRef, props);

  // Initialization effect
  useLayoutEffect(() => {
    if (internalViewRef.current && childContainerViewRef.current) {
      const outerViewLayout = measureLayout(internalViewRef.current);
      const childViewLayout = measureLayoutRelative(
        childContainerViewRef.current,
        internalViewRef.current
      );
      distanceFromWindow.current = horizontal
        ? childViewLayout.x - outerViewLayout.x
        : childViewLayout.y - outerViewLayout.y;

      recyclerViewManager.updateWindowSize(
        {
          width: horizontal ? outerViewLayout.width : childViewLayout.width,
          height: outerViewLayout.height,
        },
        distanceFromWindow.current
      );
    }
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const layoutInfo = Array.from(refHolder, ([index, viewHolderRef]) => {
      const layout = measureLayout(viewHolderRef.current!);
      return { index, dimensions: layout };
    });
    //console.log("render effect");
    if (
      recyclerViewManager.modifyChildrenLayout(layoutInfo, data?.length ?? 0)
    ) {
      setRenderId((prev) => prev + 1);
    } else {
      //console.log("commitLayout");
      // TODO: reduce perf impact of commitLayout
      viewHolderCollectionRef.current?.commitLayout();
      applyContentOffset();
    }
  });

  const onScrollHandler = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      let velocity = event.nativeEvent.velocity;
      let scrollOffset = horizontal
        ? event.nativeEvent.contentOffset.x
        : event.nativeEvent.contentOffset.y;
      if (I18nManager.isRTL && horizontal) {
        scrollOffset = adjustOffsetForRTL(
          scrollOffset,
          event.nativeEvent.contentSize.width,
          event.nativeEvent.layoutMeasurement.width
        );
        // TODO: not rounding off is leading to repeated onScroll events, precision issue
        console.log("RTL", scrollOffset, event.nativeEvent.contentOffset.x);
        if (velocity) {
          velocity = {
            x: -velocity.x,
            y: velocity.y,
          };
        }
      }
      if (recyclerViewManager.updateScrollOffset(scrollOffset, velocity)) {
        // trigger another update if there are engaged indices
        setRenderId((prev) => prev + 1);
      }
      checkBounds();
      recyclerViewManager.computeItemViewability();
      onScroll?.(event);
    },
    [horizontal, recyclerViewManager]
  );

  // const contentOffset = useContentOffsetManagement(recyclerViewManager);

  const recyclerViewContext = useMemo(() => {
    return {
      layout: () => {
        setLayoutTreeId((prev) => prev + 1);
      },
      getRef: () => {
        return ref;
      },
      getScrollViewRef: () => {
        return scrollViewRef;
      },
    };
  }, [setLayoutTreeId]);

  const validateItemSize = (index: number, size: RVDimension) => {
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
  };

  const {
    refreshControl,
    renderHeader,
    renderFooter,
    renderEmpty,
    CompatScrollView,
  } = useSecondaryProps(props);

  return (
    <RecyclerViewContextProvider value={recyclerViewContext}>
      <CompatView
        style={{ flex: horizontal ? undefined : 1 }}
        ref={internalViewRef}
        onLayout={() => {
          //context.layout();
        }}
      >
        <CompatScrollView
          {...rest}
          style={undefined}
          horizontal={horizontal}
          ref={scrollViewRef}
          contentOffset={contentOffset}
          onScroll={onScrollHandler}
          // TODO: evaluate perf
          removeClippedSubviews={false}
          refreshControl={refreshControl}
          {...overrideProps}
        >
          {renderHeader}
          <ViewHolderCollection
            viewHolderCollectionRef={viewHolderCollectionRef}
            data={data}
            horizontal={horizontal}
            renderStack={recyclerViewManager.getRenderStack()}
            getLayout={(index) => recyclerViewManager.getLayout(index)}
            refHolder={refHolder}
            onSizeChanged={validateItemSize}
            renderItem={renderItem}
            extraData={extraData}
            childContainerViewRef={childContainerViewRef}
            onCommitEffect={() => {
              checkBounds();
              recyclerViewManager.computeItemViewability();
              recyclerViewManager.disableRecycling = Boolean(disableRecycling);
            }}
            CellRendererComponent={CellRendererComponent}
            ItemSeparatorComponent={ItemSeparatorComponent}
            getChildContainerLayout={() =>
              recyclerViewManager.hasLayout()
                ? recyclerViewManager.getChildContainerDimensions()
                : undefined
            }
          />
          {renderEmpty}
          {renderFooter}
        </CompatScrollView>
      </CompatView>
    </RecyclerViewContextProvider>
  );
};

export const RecyclerView = forwardRef(
  RecyclerViewComponent
) as typeof RecyclerViewComponent;

// RecyclerView.displayName = "RecyclerView";
