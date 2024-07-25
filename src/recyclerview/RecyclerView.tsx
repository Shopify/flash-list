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

import { RVLayoutManager, RVLinearLayoutManagerImpl } from "./LayoutManager";
import { RecyclerViewManager } from "./RecyclerVIewManager";
import { ViewHolder } from "./ViewHolder";

export interface RecyclerViewProps<TItem> {
  horizontal?: boolean;
  data: ReadonlyArray<TItem> | null | undefined;
  renderItem: ListRenderItem<TItem> | null | undefined;
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
  const ifFistRenderComplete = useRef<boolean>(false);
  const { horizontal, renderItem, data } = props;
  const scrollViewRef = useRef<ScrollView>(null);
  const internalViewRef = useRef<View>(null);
  const [layoutManager, setLayoutManager] = useState<RVLayoutManager>();
  const [recycleManager] = useState<RecyclerViewManager>(
    () => new RecyclerViewManager()
  );
  const [renderStack, setRenderStack] = useState<Map<number, string>>(
    new Map()
  );

  const refHolder = useMemo(
    () => new Map<number, RefObject<View | null>>(),
    []
  );

  // Initialization effect
  useLayoutEffect(() => {
    internalViewRef.current?.measureInWindow((x, y, width, height) => {
      const correctedHeight = Platform.OS === "ios" ? height : height * 1.176;
      const correctedWidth = Platform.OS === "ios" ? width : width * 1.176;
      const newLayoutManager = new RVLinearLayoutManagerImpl(
        horizontal ? correctedHeight : correctedWidth,
        horizontal ?? false
      );

      setLayoutManager(newLayoutManager);
      recycleManager.updateLayoutManager(
        newLayoutManager,
        {
          width: correctedWidth,
          height: correctedHeight,
        },
        horizontal ?? false
      );
    });
  }, [horizontal, recycleManager]);

  useLayoutEffect(() => {
    // iterate refHolder and get measureInWindow dimensions for all objects. Don't call update but store all response in an array
    let maxIndex = -1;

    const layoutInfo = Array.from(refHolder, ([index, viewHolderRef]) => {
      const layout = { x: 0, y: 0, width: 0, height: 0 };
      viewHolderRef.current?.measureInWindow((x, y, width, height) => {
        layout.width = width;
        layout.height = height;
      });
      maxIndex = Math.max(maxIndex, index);
      return { index, dimensions: layout };
    });

    layoutManager?.modifyLayout(layoutInfo, data?.length ?? 0);

    if (maxIndex >= 0 && maxIndex < (data?.length ?? 0)) {
      if (layoutManager) {
        if (recycleManager.completeFirstRender(maxIndex)) {
          if (ifFistRenderComplete.current) {
            recycleManager.refresh();
          } else {
            requestAnimationFrame(() => {
              recycleManager.refresh();
              setRenderStack(recycleManager.getRenderStack());
            });
          }
          ifFistRenderComplete.current = true;
          // TODO: improve
        }
        setRenderStack(recycleManager.getRenderStack());
      }
    } else if (layoutManager) {
      // recycleManager.refresh();
      setRenderStack(recycleManager.getRenderStack());
    }
  }, [data, layoutManager, recycleManager, refHolder, renderStack]);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      recycleManager.updateScrollOffset(
        horizontal
          ? event.nativeEvent.contentOffset.x
          : event.nativeEvent.contentOffset.y
      );
      setRenderStack(recycleManager.getRenderStack());
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

  return (
    <View style={{ flex: horizontal ? undefined : 1 }} ref={internalViewRef}>
      <ScrollView
        horizontal={horizontal}
        ref={scrollViewRef}
        onScroll={onScroll}
        // TODO: evaluate perf
        removeClippedSubviews={false}
      >
        <View style={layoutManager?.getLayoutSize()}>
          {layoutManager && data
            ? Array.from(renderStack, ([index, reactKey]) => {
                const item = data[index];
                return (
                  <ViewHolder
                    key={reactKey}
                    index={index}
                    layout={layoutManager.getLayout(index)}
                    refHolder={refHolder}
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
