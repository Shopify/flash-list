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
  ScrollView,
  View,
} from "react-native";

import { RVDimension } from "./layout-managers/LayoutManager";
import { areDimensionsNotEqual, measureLayout } from "./utils/measureLayout";
import { RecyclerViewContextProvider } from "./RecyclerViewContextProvider";
import { useLayoutState } from "./hooks/useLayoutState";
import { useRecyclerViewManager } from "./hooks/useRecyclerViewManager";
import { RecyclerViewProps } from "./RecyclerViewProps";
import { useOnLoad } from "./hooks/useOnLoad";
import {
  ViewHolderCollection,
  ViewHolderCollectionRef,
} from "./ViewHolderCollection";

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
    keyExtractor,
    getItemType,
    extraData,
    onLoad,
  } = props;
  const scrollViewRef = useRef<ScrollView>(null);
  const internalViewRef = useRef<View>(null);
  const childContainerViewRef = useRef<View>(null);
  const distanceFromWindow = useRef(0);
  const [_, setRenderId] = useLayoutState(0);

  const refHolder = useMemo(
    () => new Map<number, RefObject<View | null>>(),
    []
  );

  const { recyclerViewManager, renderStack } = useRecyclerViewManager(props);

  const viewHolderCollectionRef = useRef<ViewHolderCollectionRef>(null);

  useOnLoad(recyclerViewManager, onLoad);

  recyclerViewManager.updateKeyExtractor((index) => {
    // TODO: choose smart default key extractor
    return keyExtractor?.(data![index], index) ?? index.toString();
  });

  recyclerViewManager.updateGetItemType((index) => {
    return (getItemType?.(data![index], index) ?? "default").toString();
  });

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
        width: horizontal ? outerViewLayout.width : childViewLayout.width,
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
      setRenderId((prev) => prev + 1);
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
      recyclerViewManager.updateScrollOffset(scrollOffset);
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
          //context.layout();
        }
      },
    };
  }, [recyclerViewManager, setRenderId]);

  return (
    <RecyclerViewContextProvider value={context}>
      <View style={{ flex: horizontal ? undefined : 1 }} ref={internalViewRef}>
        <ScrollView
          horizontal={horizontal}
          ref={scrollViewRef}
          //contentOffset={contentOffset}
          onScroll={onScroll}
          // TODO: evaluate perf
          removeClippedSubviews={false}
        >
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
            getChildContainerLayout={() =>
              recyclerViewManager.hasLayout()
                ? recyclerViewManager.getChildContainerLayout()
                : undefined
            }
          />
        </ScrollView>
      </View>
    </RecyclerViewContextProvider>
  );
};

export const RecyclerView = forwardRef(
  RecyclerViewComponent
) as typeof RecyclerViewComponent;

// RecyclerView.displayName = "RecyclerView";
