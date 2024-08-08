import { LayoutChangeEvent, View } from "react-native";
import React, {
  RefObject,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";

import { FlashListProps, RenderTarget } from "../FlashListProps";

import { RVLayout } from "./LayoutManager";
import { areDimensionsEqual } from "./utils/measureLayout";

export interface ViewHolderProps<TItem> {
  index: number;
  layout: RVLayout;
  refHolder: Map<number, RefObject<View | null>>;
  onSizeChanged: (index: number) => void;
  extraData: any;
  target: RenderTarget;
  item: TItem;
  renderItem: FlashListProps<TItem>["renderItem"];
}
const ViewHolderInternal = <TItem,>(props: ViewHolderProps<TItem>) => {
  // create ref for View
  const viewRef = useRef<View>(null);
  const {
    index,
    refHolder,
    layout,
    onSizeChanged,
    renderItem,
    extraData,
    item,
    target,
  } = props;

  useLayoutEffect(() => {
    refHolder.set(index, viewRef);
    return () => {
      if (refHolder.get(index) === viewRef) {
        refHolder.delete(index);
      }
    };
  }, [index, refHolder]);

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      // height width don't match layot call
      if (
        !areDimensionsEqual(layout.height, event.nativeEvent.layout.height) ||
        !areDimensionsEqual(layout.width, event.nativeEvent.layout.width)
      ) {
        const diff = layout.height - event.nativeEvent.layout.height;
        if (Math.abs(diff) < 1) {
          console.log(
            "Layout height mismatch",
            layout.height - event.nativeEvent.layout.height,
            index
          );
        }
        onSizeChanged(index);
      }
    },
    [index, layout.height, layout.width, onSizeChanged]
  );

  console.log("ViewHolder re-render", index);

  const children = useMemo(() => {
    return renderItem?.({ item, index, extraData, target }) ?? null;
  }, [item, index, extraData, target, renderItem]);

  return (
    <View
      ref={viewRef}
      onLayout={onLayout}
      style={{
        position: "absolute",
        width: layout.enforcedWidth ? layout.width : undefined,
        height: layout.enforcedHeight ? layout.height : undefined,
        minHeight: layout.minHeight,
        minWidth: layout.minWidth,
        maxHeight: layout.maxHeight,
        maxWidth: layout.maxWidth,
        left: layout.x,
        top: layout.y,
      }}
    >
      {children}
    </View>
  );
};

export const ViewHolder = React.memo(
  ViewHolderInternal,
  (prevProps, nextProps) => {
    // compare all props and spread layout
    return (
      prevProps.index === nextProps.index &&
      areLayoutsEqual(prevProps.layout, nextProps.layout) &&
      prevProps.refHolder === nextProps.refHolder &&
      prevProps.onSizeChanged === nextProps.onSizeChanged &&
      prevProps.extraData === nextProps.extraData &&
      prevProps.target === nextProps.target &&
      prevProps.item === nextProps.item &&
      prevProps.renderItem === nextProps.renderItem
    );
  }
);

function areLayoutsEqual(prevLayout: RVLayout, nextLayout: RVLayout): boolean {
  return (
    prevLayout.x === nextLayout.x &&
    prevLayout.y === nextLayout.y &&
    prevLayout.width === nextLayout.width &&
    prevLayout.height === nextLayout.height &&
    prevLayout.minHeight === nextLayout.minHeight &&
    prevLayout.minWidth === nextLayout.minWidth &&
    prevLayout.maxHeight === nextLayout.maxHeight &&
    prevLayout.maxWidth === nextLayout.maxWidth &&
    prevLayout.enforcedWidth === nextLayout.enforcedWidth &&
    prevLayout.enforcedHeight === nextLayout.enforcedHeight
  );
}
