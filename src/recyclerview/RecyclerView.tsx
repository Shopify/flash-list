import React, {
  RefObject,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  View,
} from "react-native";

import { ListRenderItem } from "../FlashListProps";

import { SpanSizeInfo } from "./LayoutManager";
import { RecyclerViewManager } from "./RecyclerVIewManager";
import { ViewHolder } from "./ViewHolder";
import { RVGridLayoutManagerImpl } from "./GridLayoutManager";

export interface RecyclerViewProps<TItem> {
  horizontal?: boolean;
  data: ReadonlyArray<TItem> | null | undefined;
  numColumns?: number;
  renderItem: ListRenderItem<TItem> | null | undefined;
  keyExtractor?: ((item: TItem, index: number) => string) | undefined;
  getItemType?: (
    item: TItem,
    index: number,
    extraData?: any
  ) => string | number | undefined;
  overrideItemLayout?: (
    layout: SpanSizeInfo,
    item: TItem,
    index: number,
    maxColumns: number,
    extraData?: any
  ) => void;
}

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
    numColumns,
  } = props;
  const scrollViewRef = useRef<ScrollView>(null);
  const internalViewRef = useRef<View>(null);
  const childContainerViewRef = useRef<View>(null);
  const distanceFromWindow = useRef(0);

  const [recycleManager] = useState<RecyclerViewManager>(
    () =>
      new RecyclerViewManager(
        // when render stack changes
        (renderStack) => setRenderStack(renderStack),
        // on first render complete
        () => {
          requestAnimationFrame(() => {
            recycleManager.refresh();
          });
        }
      )
  );
  const [renderStack, setRenderStack] = useState<Map<number, string>>(
    new Map()
  );

  const refHolder = useMemo(
    () => new Map<number, RefObject<View | null>>(),
    []
  );

  const layoutManager = recycleManager.getLayoutManager();

  recycleManager.updateKeyExtractor((index) => {
    // TODO: choose smart default key extractor
    return keyExtractor?.(data![index], index) ?? index.toString();
  });

  recycleManager.updateGetItemType((index) => {
    return (getItemType?.(data![index], index) ?? "default").toString();
  });

  layoutManager?.updateLayoutParams({
    overrideItemLayout: (index, layout) => {
      props.overrideItemLayout?.(layout, data![index], index, numColumns ?? 1);
    },
    horizontal,
    maxColumns: numColumns,
    windowSize: recycleManager.getWindowSize(),
  });

  // Initialization effect
  useLayoutEffect(() => {
    internalViewRef.current?.measureInWindow((x1, y1, _, height) => {
      childContainerViewRef.current?.measureInWindow((x2, y2, width, __) => {
        distanceFromWindow.current = horizontal ? x2 - x1 : y2 - y1;
        if (Platform.OS === "android") {
          distanceFromWindow.current *= 1.176;
        }
        const correctedHeight = Platform.OS === "ios" ? height : height * 1.176;
        const correctedWidth = Platform.OS === "ios" ? width : width * 1.176;
        const newLayoutManager = new RVGridLayoutManagerImpl({
          windowSize: { width: correctedWidth, height: correctedHeight },
          maxColumns: numColumns ?? 1,
          matchHeightsWithNeighbours: true,
        });
        recycleManager.updateLayoutManager(
          newLayoutManager,
          {
            width: correctedWidth,
            height: correctedHeight,
          },
          horizontal ?? false
        );
        recycleManager.startRender();
      });
    });
  }, [horizontal, recycleManager]);

  useLayoutEffect(() => {
    // iterate refHolder and get measureInWindow dimensions for all objects. Don't call update but store all response in an array

    const layoutInfo = Array.from(refHolder, ([index, viewHolderRef]) => {
      const layout = { x: 0, y: 0, width: 0, height: 0 };
      viewHolderRef.current?.measureInWindow((x, y, width, height) => {
        layout.width = width;
        layout.height = height;
      });
      return { index, dimensions: layout };
    });
    if (recycleManager.getLayoutManager()) {
      recycleManager
        .getLayoutManager()
        .modifyLayout(layoutInfo, data?.length ?? 0);
      if (recycleManager.getIsFirstLayoutComplete()) {
        recycleManager.refresh();
      } else {
        recycleManager.resumeProgressiveRender();
      }
    }
  }, [data, recycleManager, refHolder, renderStack]);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      recycleManager.updateScrollOffset(
        (horizontal
          ? event.nativeEvent.contentOffset.x
          : event.nativeEvent.contentOffset.y) - distanceFromWindow.current
      );
    },
    [horizontal, recycleManager]
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

  // TODO: Replace with sync onLayout and better way to refresh
  const forceUpdate = useCallback(() => {
    setRenderStack(new Map(recycleManager.getRenderStack()));
    requestAnimationFrame(() => {
      setRenderStack(new Map(recycleManager.getRenderStack()));
    });
  }, [recycleManager]);

  return (
    <View style={{ flex: horizontal ? undefined : 1 }} ref={internalViewRef}>
      <ScrollView
        horizontal={horizontal}
        ref={scrollViewRef}
        onScroll={onScroll}
        // TODO: evaluate perf
        removeClippedSubviews={false}
      >
        <View
          ref={childContainerViewRef}
          style={layoutManager?.getLayoutSize()}
        >
          {layoutManager && data
            ? Array.from(renderStack, ([index, reactKey]) => {
                const item = data[index];
                return (
                  <ViewHolder
                    key={reactKey}
                    index={index}
                    layout={layoutManager.getLayout(index)}
                    refHolder={refHolder}
                    onSizeChanged={forceUpdate}
                  >
                    {renderItem?.({ item, index, target: "Cell" })}
                  </ViewHolder>
                );
              })
            : null}
        </View>
      </ScrollView>
    </View>
  );
};

export const RecyclerView = forwardRef(
  RecyclerViewComponent
) as typeof RecyclerViewComponent;

// RecyclerView.displayName = "RecyclerView";
