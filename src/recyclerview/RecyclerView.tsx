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
    console.log("useLayoutEffect 1");

    internalViewRef.current?.measureInWindow((x, y, width, height) => {
      const newLayoutManager = new RVLayoutManagerImpl(
        horizontal ? height : width,
        horizontal ?? false
      );
      setLayoutManager(newLayoutManager);
      recycleManager.updateLayoutManager(newLayoutManager, { width, height });
    });
  }, [horizontal, recycleManager]);

  useLayoutEffect(() => {
    console.log("useLayoutEffect 2", refHolder.size);

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
      //TODO: improve
      recycleManager.refresh();
      setRenderStack(recycleManager.getRenderStack());
    }
  }, [data, layoutManager, recycleManager, renderStack]);

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
  console.log("layout size", layoutManager?.getLayoutSize());

  return (
    <View style={{ flex: 1 }} ref={internalViewRef}>
      <ScrollView ref={scrollViewRef} onScroll={onScroll}>
        <View style={layoutManager?.getLayoutSize()}>
          {layoutManager && data
            ? Array.from(renderStack, ([index, reactKey]) => {
                const item = data[index];
                return (
                  <ViewHolder
                    reactKey={reactKey}
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
