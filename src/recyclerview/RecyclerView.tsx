import React, {
  RefObject,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  View,
} from "react-native";

import { ListRenderItem } from "../FlashListProps";

import { RVLayoutManager, RVLayoutManagerImpl } from "./LayoutManager";
import { RecyclerViewManager } from "./RecyclerVIewManager";
import { ViewHolder } from "./ViewHolder";

export interface RecyclerViewProps<TItem> {
  horizontal?: boolean;
  data: ReadonlyArray<TItem> | null | undefined;
  renderItem: ListRenderItem<TItem> | null | undefined;
}

export const RecyclerView = <T1,>(props: RecyclerViewProps<T1>) => {
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
      const newLayoutManager = new RVLayoutManagerImpl(
        horizontal ? correctedHeight : correctedWidth,
        horizontal ?? false
      );

      setLayoutManager(newLayoutManager);
      recycleManager.updateLayoutManager(newLayoutManager, {
        width: correctedWidth,
        height: correctedHeight,
      });
    });
  }, [horizontal, recycleManager]);

  useLayoutEffect(() => {
    // iterate refHolder and get measureInWindow dimensions for all objects. Don't call update but store all response in an array
    const layoutInfo = Array.from(refHolder, ([index, ref]) => {
      const layout = { x: 0, y: 0, width: 0, height: 0 };
      ref.current?.measureInWindow((x, y, width, height) => {
        layout.width = width;
        layout.height = height;
      });
      return { index, dimensions: layout };
    });
    layoutManager?.modifyLayout(layoutInfo, data?.length ?? 0);
    if (layoutManager) {
      // TODO: improve
      recycleManager.refresh();
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

  return (
    <View style={{ flex: 1 }} ref={internalViewRef}>
      <ScrollView
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
