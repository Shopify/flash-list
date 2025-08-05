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
  useId,
} from "react";
import {
  Animated,
  I18nManager,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";

import { FlashListRef } from "../FlashListRef";
import { ErrorMessages } from "../errors/ErrorMessages";
import { WarningMessages } from "../errors/WarningMessages";

import { RVDimension } from "./layout-managers/LayoutManager";
import {
  areDimensionsNotEqual,
  measureFirstChildLayout,
  measureItemLayout,
  measureParentSize,
} from "./utils/measureLayout";
import {
  RecyclerViewContext,
  RecyclerViewContextProvider,
  useRecyclerViewContext,
} from "./RecyclerViewContextProvider";
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
import { RenderTimeTracker } from "./helpers/RenderTimeTracker";

/**
 * Main RecyclerView component that handles list rendering, scrolling, and item recycling.
 * @template T - The type of items in the list
 */
const RecyclerViewComponent = <T,>(
  props: RecyclerViewProps<T>,
  ref: React.Ref<FlashListRef<T>>
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
    style,
    stickyHeaderIndices,
    maintainVisibleContentPosition,
    onCommitLayoutEffect,
    ...rest
  } = props;

  const [renderTimeTracker] = useState(() => new RenderTimeTracker());

  renderTimeTracker.startTracking();

  // Core refs for managing scroll view, internal view, and child container
  const scrollViewRef = useRef<CompatScroller>(null);
  const internalViewRef = useRef<CompatView>(null);
  const firstChildViewRef = useRef<CompatView>(null);
  const containerViewSizeRef = useRef<RVDimension | undefined>(undefined);
  const pendingChildIds = useRef<Set<string>>(new Set()).current;

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
  const { recyclerViewManager, velocityTracker } =
    useRecyclerViewManager(props);
  const {
    applyOffsetCorrection,
    computeFirstVisibleIndexForOffsetCorrection,
    applyInitialScrollIndex,
    handlerMethods,
  } = useRecyclerViewController(
    recyclerViewManager,
    ref,
    scrollViewRef,
    scrollAnchorRef
  );

  // Initialize view holder collection ref
  const viewHolderCollectionRef = useRef<ViewHolderCollectionRef>(null);

  // Hook to handle list loading
  useOnListLoad(recyclerViewManager, onLoad);

  // Hook to detect when scrolling reaches list bounds
  const { checkBounds } = useBoundDetection(recyclerViewManager, scrollViewRef);

  const isHorizontalRTL = I18nManager.isRTL && horizontal;

  /**
   * Initialize the RecyclerView by measuring and setting up the window size
   * This effect runs when the component mounts or when layout changes
   */
  useLayoutEffect(() => {
    if (internalViewRef.current && firstChildViewRef.current) {
      // Measure the outer and inner container layouts
      const outerViewLayout = measureParentSize(internalViewRef.current);
      const firstChildViewLayout = measureFirstChildLayout(
        firstChildViewRef.current,
        internalViewRef.current
      );

      containerViewSizeRef.current = outerViewLayout;

      // Calculate offset of first item
      const firstItemOffset = horizontal
        ? firstChildViewLayout.x - outerViewLayout.x
        : firstChildViewLayout.y - outerViewLayout.y;

      // Update the RecyclerView manager with window dimensions
      recyclerViewManager.updateLayoutParams(
        {
          width: horizontal
            ? outerViewLayout.width
            : firstChildViewLayout.width,
          height: horizontal
            ? firstChildViewLayout.height
            : outerViewLayout.height,
        },
        isHorizontalRTL && recyclerViewManager.hasLayout()
          ? firstItemOffset -
              recyclerViewManager.getChildContainerDimensions().width
          : firstItemOffset
      );
    }
  });

  /**
   * Effect to handle layout updates for list items
   * This ensures proper positioning and recycling of items
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    if (pendingChildIds.size > 0) {
      return;
    }
    const layoutInfo = Array.from(refHolder, ([index, viewHolderRef]) => {
      const layout = measureItemLayout(
        viewHolderRef.current!,
        recyclerViewManager.tryGetLayout(index)
      );

      // comapre height with stored layout
      // const storedLayout = recyclerViewManager.getLayout(index);
      // if (
      //   storedLayout.height !== layout.height &&
      //   storedLayout.isHeightMeasured
      // ) {
      //   console.log(
      //     "height changed",
      //     index,
      //     layout.height,
      //     storedLayout.height
      //   );
      // }
      return { index, dimensions: layout };
    });

    const hasExceededMaxRendersWithoutCommit =
      renderTimeTracker.hasExceededMaxRendersWithoutCommit();

    if (hasExceededMaxRendersWithoutCommit) {
      console.warn(WarningMessages.exceededMaxRendersWithoutCommit);
    }

    if (
      recyclerViewManager.modifyChildrenLayout(layoutInfo, data?.length ?? 0) &&
      !hasExceededMaxRendersWithoutCommit
    ) {
      // Trigger re-render if layout modifications were made
      setRenderId((prev) => prev + 1);
    } else {
      viewHolderCollectionRef.current?.commitLayout();
      applyOffsetCorrection();
    }
  });

  /**
   * Scroll event handler that manages scroll position, velocity, and RTL support
   */
  const onScrollHandler = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (recyclerViewManager.ignoreScrollEvents) {
        return;
      }

      let scrollOffset = horizontal
        ? event.nativeEvent.contentOffset.x
        : event.nativeEvent.contentOffset.y;

      // Handle RTL (Right-to-Left) layout adjustments
      if (isHorizontalRTL) {
        scrollOffset = adjustOffsetForRTL(
          scrollOffset,
          event.nativeEvent.contentSize.width,
          event.nativeEvent.layoutMeasurement.width
        );
      }

      velocityTracker.computeVelocity(
        scrollOffset,
        recyclerViewManager.getAbsoluteLastScrollOffset(),
        Boolean(horizontal),
        (velocity, isMomentumEnd) => {
          if (recyclerViewManager.ignoreScrollEvents) {
            return;
          }

          if (isMomentumEnd) {
            computeFirstVisibleIndexForOffsetCorrection();
            if (!recyclerViewManager.isOffsetProjectionEnabled) {
              return;
            }
            recyclerViewManager.resetVelocityCompute();
          }
          // Update scroll position and trigger re-render if needed
          if (recyclerViewManager.updateScrollOffset(scrollOffset, velocity)) {
            setRenderId((prev) => prev + 1);
          }
        }
      );

      // Update sticky headers and check bounds
      stickyHeaderRef.current?.reportScrollEvent(event.nativeEvent);
      checkBounds();

      // Record interaction and compute item visibility
      recyclerViewManager.recordInteraction();
      recyclerViewManager.computeItemViewability();

      // Call user-provided onScroll handler
      recyclerViewManager.props.onScroll?.(event);
    },
    [
      checkBounds,
      computeFirstVisibleIndexForOffsetCorrection,
      horizontal,
      isHorizontalRTL,
      recyclerViewManager,
      velocityTracker,
    ]
  );

  const parentRecyclerViewContext = useRecyclerViewContext();
  const recyclerViewId = useId();

  // Create context for child components
  const recyclerViewContext: RecyclerViewContext<T> = useMemo(() => {
    return {
      layout: () => {
        setLayoutTreeId((prev) => prev + 1);
      },
      getRef: () => {
        if (recyclerViewManager.isDisposed) {
          return null;
        }
        return handlerMethods;
      },
      getParentRef: () => {
        return parentRecyclerViewContext?.getRef() ?? null;
      },
      getParentScrollViewRef: () => {
        return parentRecyclerViewContext?.getScrollViewRef() ?? null;
      },
      getScrollViewRef: () => {
        return scrollViewRef.current;
      },
      markChildLayoutAsPending: (id: string) => {
        pendingChildIds.add(id);
      },
      unmarkChildLayoutAsPending: (id: string) => {
        if (pendingChildIds.has(id)) {
          pendingChildIds.delete(id);
          recyclerViewContext.layout();
        }
      },
    };
  }, [
    handlerMethods,
    parentRecyclerViewContext,
    pendingChildIds,
    recyclerViewManager.isDisposed,
    setLayoutTreeId,
  ]);

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
        // console.log(
        //   "invalid size",
        //   index,
        //   width,
        //   size.width,
        //   height,
        //   size.height
        // );
        // TODO: Add a warning for missing useLayoutState
        recyclerViewContext.layout();
      }
    },
    [recyclerViewContext, recyclerViewManager]
  );

  // Get secondary props and components
  const {
    refreshControl,
    renderHeader,
    renderFooter,
    renderEmpty,
    CompatScrollView,
  } = useSecondaryProps(props);

  if (
    !recyclerViewManager.getIsFirstLayoutComplete() &&
    recyclerViewManager.getDataLength() > 0
  ) {
    parentRecyclerViewContext?.markChildLayoutAsPending(recyclerViewId);
  }

  // Render sticky headers if configured
  const stickyHeaders = useMemo(() => {
    if (
      data &&
      data.length > 0 &&
      stickyHeaderIndices &&
      stickyHeaderIndices.length > 0
    ) {
      if (horizontal) {
        throw new Error(ErrorMessages.stickyHeadersNotSupportedForHorizontal);
      }
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
  }, [
    data,
    stickyHeaderIndices,
    renderItem,
    scrollY,
    horizontal,
    recyclerViewManager,
    extraData,
  ]);

  // Set up scroll event handling with animation support for sticky headers
  const animatedEvent = useMemo(() => {
    if (stickyHeaders) {
      return Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true, listener: onScrollHandler }
      );
    }
    return onScrollHandler;
  }, [onScrollHandler, scrollY, stickyHeaders]);

  const shouldMaintainVisibleContentPosition =
    recyclerViewManager.shouldMaintainVisibleContentPosition();

  const maintainVisibleContentPositionInternal = useMemo(() => {
    if (shouldMaintainVisibleContentPosition) {
      return {
        ...maintainVisibleContentPosition,
        minIndexForVisible: 0,
      };
    }
    return undefined;
  }, [maintainVisibleContentPosition, shouldMaintainVisibleContentPosition]);

  const shouldRenderFromBottom =
    recyclerViewManager.getDataLength() > 0 &&
    (maintainVisibleContentPosition?.startRenderingFromBottom ?? false);

  // Create view for measuring bounded size
  const viewToMeasureBoundedSize = useMemo(() => {
    return (
      <CompatView
        style={{
          height: horizontal ? undefined : 0,
          width: horizontal ? 0 : undefined,
        }}
        ref={firstChildViewRef}
      />
    );
  }, [horizontal]);

  const scrollAnchor = useMemo(() => {
    if (shouldMaintainVisibleContentPosition) {
      return (
        <ScrollAnchor
          horizontal={Boolean(horizontal)}
          scrollAnchorRef={scrollAnchorRef}
        />
      );
    }
    return null;
  }, [horizontal, shouldMaintainVisibleContentPosition]);

  // console.log("render", recyclerViewManager.getRenderStack());

  // Render the main RecyclerView structure
  return (
    <RecyclerViewContextProvider value={recyclerViewContext}>
      <CompatView
        style={{
          flex: horizontal ? undefined : 1,
          overflow: "hidden",
          ...style,
        }}
        ref={internalViewRef}
        collapsable={false}
        onLayout={(event) => {
          if (
            areDimensionsNotEqual(
              event.nativeEvent.layout.width,
              containerViewSizeRef.current?.width ?? 0
            ) ||
            areDimensionsNotEqual(
              event.nativeEvent.layout.height,
              containerViewSizeRef.current?.height ?? 0
            )
          ) {
            // console.log(
            //   "onLayout",

            //   recyclerViewManager.getWindowSize(),
            //   event.nativeEvent.layout
            // );
            recyclerViewContext.layout();
          }
        }}
      >
        <CompatScrollView
          {...rest}
          horizontal={horizontal}
          ref={scrollViewRef}
          onScroll={animatedEvent}
          maintainVisibleContentPosition={
            maintainVisibleContentPositionInternal
          }
          refreshControl={refreshControl}
          {...overrideProps}
        >
          {/* Scroll anchor for maintaining content position */}
          {scrollAnchor}
          {isHorizontalRTL && viewToMeasureBoundedSize}
          {renderHeader}
          {!isHorizontalRTL && viewToMeasureBoundedSize}
          {/* Main list content */}
          <ViewHolderCollection
            viewHolderCollectionRef={viewHolderCollectionRef}
            data={data}
            horizontal={horizontal}
            renderStack={recyclerViewManager.getRenderStack()}
            getLayout={(index) => recyclerViewManager.getLayout(index)}
            getAdjustmentMargin={() => {
              if (!shouldRenderFromBottom || !recyclerViewManager.hasLayout()) {
                return 0;
              }

              const windowSize = horizontal
                ? recyclerViewManager.getWindowSize().width
                : recyclerViewManager.getWindowSize().height;
              const childContainerSize = horizontal
                ? recyclerViewManager.getChildContainerDimensions().width
                : recyclerViewManager.getChildContainerDimensions().height;

              return Math.max(
                0,
                windowSize -
                  childContainerSize -
                  recyclerViewManager.firstItemOffset
              );
            }}
            refHolder={refHolder}
            onSizeChanged={validateItemSize}
            renderItem={renderItem}
            extraData={extraData}
            onCommitLayoutEffect={() => {
              applyInitialScrollIndex();
              parentRecyclerViewContext?.unmarkChildLayoutAsPending(
                recyclerViewId
              );
              onCommitLayoutEffect?.();
            }}
            onCommitEffect={() => {
              renderTimeTracker.markRenderComplete();
              recyclerViewManager.updateAverageRenderTime(
                renderTimeTracker.getAverageRenderTime()
              );
              applyInitialScrollIndex();
              checkBounds();
              recyclerViewManager.computeItemViewability();
              recyclerViewManager.animationOptimizationsEnabled = false;
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

// Set displayName for the inner component
RecyclerViewComponent.displayName = "FlashList";

// Type definition for the RecyclerView component
type RecyclerViewType = <T>(
  props: RecyclerViewProps<T> & { ref?: React.Ref<FlashListRef<T>> }
) => React.JSX.Element;

// Create and export the memoized, forwarded ref component
const RecyclerView = React.memo(
  forwardRef(RecyclerViewComponent)
) as RecyclerViewType;

export { RecyclerView };
