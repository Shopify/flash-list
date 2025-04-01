/**
 * RecyclerView is a high-performance list component that efficiently renders and recycles list items.
 * It's designed to handle large lists with optimal memory usage and smooth scrolling.
 */
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
  Animated,
  I18nManager,
  NativeScrollEvent,
  NativeSyntheticEvent,
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
import { CompatView } from "./components/CompatView";
import { CompatScroller } from "./components/CompatScroller";
import { useBoundDetection } from "./hooks/useBoundDetection";
import { adjustOffsetForRTL } from "./utils/adjustOffsetForRTL";
import { useSecondaryProps } from "./hooks/useSecondaryProps";
import { StickyHeaders, StickyHeaderRef } from "./components/StickyHeaders";
import { ScrollAnchor, ScrollAnchorRef } from "./components/ScrollAnchor";
import { useRecyclerViewController } from "./hooks/useRecyclerViewController";

/**
 * Main RecyclerView component that handles list rendering, scrolling, and item recycling.
 * @template T - The type of items in the list
 */
const RecyclerViewComponent = <T,>(
  props: RecyclerViewProps<T>,
  ref: React.Ref<any>
) => {
  // Destructure props and initialize refs
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
    style,
    stickyHeaderIndices,
    maintainVisibleContentPosition,
    ...rest
  } = props;

  // Core refs for managing scroll view, internal view, and child container
  const scrollViewRef = useRef<CompatScroller>(null);
  const internalViewRef = useRef<CompatView>(null);
  const childContainerViewRef = useRef<CompatView>(null);

  // Track scroll position
  const scrollY = useRef(new Animated.Value(0)).current;

  // Refs for sticky headers and scroll anchoring
  const stickyHeaderRef = useRef<StickyHeaderRef>(null);
  const scrollAnchorRef = useRef<ScrollAnchorRef>(null);

  // State for managing layout and render updates
  const [_, setLayoutTreeId] = useLayoutState(0);
  const [__, setRenderId] = useState(0);

  // Map to store refs for each item in the list
  const refHolder = useMemo(
    () => new Map<number, RefObject<CompatView | null>>(),
    []
  );

  // Initialize core RecyclerView manager and content offset management
  const { recyclerViewManager } = useRecyclerViewManager(props);
  const { applyContentOffset } = useRecyclerViewController(
    recyclerViewManager,
    ref,
    scrollViewRef,
    scrollAnchorRef,
    props
  );

  // Initialize view holder collection ref
  const viewHolderCollectionRef = useRef<ViewHolderCollectionRef>(null);

  // Hook to handle list loading
  useOnListLoad(recyclerViewManager, onLoad);

  // Hook to detect when scrolling reaches list bounds
  const { checkBounds } = useBoundDetection(
    recyclerViewManager,
    props,
    scrollViewRef
  );

  /**
   * Initialize the RecyclerView by measuring and setting up the window size
   * This effect runs when the component mounts or when layout changes
   */
  useLayoutEffect(() => {
    if (internalViewRef.current && childContainerViewRef.current) {
      // Measure the outer and inner container layouts
      const outerViewLayout = measureLayout(internalViewRef.current);
      const childViewLayout = measureLayoutRelative(
        childContainerViewRef.current,
        internalViewRef.current
      );

      // Calculate offset of first item
      const firstItemOffset = horizontal
        ? childViewLayout.x - outerViewLayout.x
        : childViewLayout.y - outerViewLayout.y;

      // Update the RecyclerView manager with window dimensions
      recyclerViewManager.updateWindowSize(
        {
          width: horizontal ? outerViewLayout.width : childViewLayout.width,
          height: horizontal ? childViewLayout.height : outerViewLayout.height,
        },
        firstItemOffset
      );
    }
  });

  /**
   * Effect to handle layout updates for list items
   * This ensures proper positioning and recycling of items
   */
  useLayoutEffect(() => {
    const layoutInfo = Array.from(refHolder, ([index, viewHolderRef]) => {
      const layout = measureLayout(viewHolderRef.current!);
      return { index, dimensions: layout };
    });

    if (
      recyclerViewManager.modifyChildrenLayout(layoutInfo, data?.length ?? 0)
    ) {
      // Trigger re-render if layout modifications were made
      setRenderId((prev) => prev + 1);
    } else {
      //console.log("commitLayout");
      // TODO: reduce perf impact of commitLayout
      viewHolderCollectionRef.current?.commitLayout();
      applyContentOffset();
    }
  });

  /**
   * Scroll event handler that manages scroll position, velocity, and RTL support
   */
  const onScrollHandler = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      let velocity = event.nativeEvent.velocity;
      let scrollOffset = horizontal
        ? event.nativeEvent.contentOffset.x
        : event.nativeEvent.contentOffset.y;

      // Handle RTL (Right-to-Left) layout adjustments
      if (I18nManager.isRTL && horizontal) {
        scrollOffset = adjustOffsetForRTL(
          scrollOffset,
          event.nativeEvent.contentSize.width,
          event.nativeEvent.layoutMeasurement.width
        );
        if (velocity) {
          velocity = {
            x: -velocity.x,
            y: velocity.y,
          };
        }
      }

      // Update scroll position and trigger re-render if needed
      if (recyclerViewManager.updateScrollOffset(scrollOffset, velocity)) {
        setRenderId((prev) => prev + 1);
      }

      // Update sticky headers and check bounds
      stickyHeaderRef.current?.reportScrollEvent(event.nativeEvent);
      checkBounds();

      // Record interaction and compute item visibility
      recyclerViewManager.recordInteraction();
      recyclerViewManager.computeItemViewability();

      // Call user-provided onScroll handler
      onScroll?.(event);
    },
    [horizontal, recyclerViewManager]
  );

  // Create context for child components
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

  /**
   * Validates that item dimensions match the expected layout
   */
  const validateItemSize = useCallback(
    (index: number, size: RVDimension) => {
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
    [recyclerViewManager]
  );

  // Get secondary props and components
  const {
    refreshControl,
    renderHeader,
    renderFooter,
    renderEmpty,
    CompatScrollView,
  } = useSecondaryProps(props);

  // Render sticky headers if configured
  const stickyHeaders = useMemo(() => {
    if (
      data &&
      data.length > 0 &&
      stickyHeaderIndices &&
      stickyHeaderIndices.length > 0
    ) {
      return (
        <StickyHeaders
          stickyHeaderIndices={stickyHeaderIndices}
          data={data}
          renderItem={renderItem}
          scrollY={scrollY}
          stickyHeaderRef={stickyHeaderRef}
          recyclerViewManager={recyclerViewManager}
          extraData={extraData}
        />
      );
    }
    return null;
  }, [data, stickyHeaderIndices, renderItem, extraData]);

  // Set up scroll event handling with animation support for sticky headers
  const animatedEvent = useMemo(() => {
    if (stickyHeaders) {
      return Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true, listener: onScrollHandler }
      );
    }
    return onScrollHandler;
  }, [onScrollHandler, stickyHeaders]);

  const maintainVisibleContentPositionInternal = useMemo(() => {
    if (maintainVisibleContentPosition && !horizontal) {
      return {
        ...maintainVisibleContentPosition,
        minIndexForVisible: 0,
      };
    }
    return undefined;
  }, [maintainVisibleContentPosition]);

  const shouldRenderFromBottom =
    maintainVisibleContentPositionInternal?.startRenderingFromBottom ?? false;

  // Calculate minimum height adjustment for bottom rendering
  const adjustmentMinHeight = recyclerViewManager.hasLayout()
    ? Math.max(
        0,
        recyclerViewManager.getWindowSize().height -
          recyclerViewManager.getChildContainerDimensions().height -
          recyclerViewManager.firstItemOffset
      )
    : 0;

  // Create view for measuring bounded size
  const viewToMeasureBoundedSize = useMemo(() => {
    return (
      <CompatView
        style={{
          height: horizontal ? undefined : 0,
          width: horizontal ? 0 : undefined,
          minHeight: shouldRenderFromBottom ? adjustmentMinHeight : undefined,
        }}
        ref={childContainerViewRef}
      />
    );
  }, [horizontal, shouldRenderFromBottom, adjustmentMinHeight]);

  // Render the main RecyclerView structure
  return (
    <RecyclerViewContextProvider value={recyclerViewContext}>
      <CompatView
        style={{ flex: horizontal ? undefined : 1, ...style }}
        ref={internalViewRef}
        collapsable={false}
        onLayout={(event) => {
          if (
            areDimensionsNotEqual(
              event.nativeEvent.layout.width,
              recyclerViewManager.getWindowSize().width
            ) ||
            areDimensionsNotEqual(
              event.nativeEvent.layout.height,
              recyclerViewManager.getWindowSize().height
            )
          ) {
            console.log("onLayout");
            recyclerViewContext.layout();
          }
        }}
      >
        <CompatScrollView
          {...rest}
          horizontal={horizontal}
          ref={scrollViewRef}
          onScroll={animatedEvent}
          // TODO: evaluate perf
          maintainVisibleContentPosition={
            maintainVisibleContentPositionInternal
          }
          refreshControl={refreshControl}
          {...overrideProps}
        >
          {/* Scroll anchor for maintaining content position */}
          {maintainVisibleContentPositionInternal && (
            <ScrollAnchor scrollAnchorRef={scrollAnchorRef} />
          )}
          {renderHeader}
          {viewToMeasureBoundedSize}
          {/* Main list content */}
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
        {stickyHeaders}
      </CompatView>
    </RecyclerViewContextProvider>
  );
};

// Type definition for the RecyclerView component
type RecyclerViewType = <T>(
  props: RecyclerViewProps<T> & { ref?: React.Ref<any> }
) => React.JSX.Element;

// Create and export the memoized, forwarded ref component
const RecyclerView = React.memo(
  forwardRef(RecyclerViewComponent)
) as RecyclerViewType;

export { RecyclerView };
