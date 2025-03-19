import { LayoutChangeEvent } from "react-native";
import React, {
  RefObject,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";

import { FlashListProps, RenderTarget } from "../FlashListProps";

import { RVDimension, RVLayout } from "./layout-managers/LayoutManager";
import { CompatView } from "./components/CompatView";

export interface ViewHolderProps<TItem> {
  index: number;
  layout: RVLayout;
  refHolder: Map<number, RefObject<CompatView | null>>;
  onSizeChanged: (index: number, size: RVDimension) => void;
  extraData: any;
  target: RenderTarget;
  item: TItem;
  trailingItem: TItem | undefined;
  renderItem: FlashListProps<TItem>["renderItem"];
  CellRendererComponent?: FlashListProps<TItem>["CellRendererComponent"];
  ItemSeparatorComponent?: FlashListProps<TItem>["ItemSeparatorComponent"];
  horizontal?: FlashListProps<TItem>["horizontal"];
}
const ViewHolderInternal = <TItem,>(props: ViewHolderProps<TItem>) => {
  // create ref for View
  const viewRef = useRef<CompatView>(null);
  const {
    index,
    refHolder,
    layout,
    onSizeChanged,
    renderItem,
    extraData,
    item,
    target,
    CellRendererComponent,
    ItemSeparatorComponent,
    trailingItem,
    horizontal,
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
      onSizeChanged(index, event.nativeEvent.layout);
    },
    [index, onSizeChanged]
  );

  const separator = useMemo(() => {
    return ItemSeparatorComponent ? (
      <ItemSeparatorComponent leadingItem={item} trailingItem={trailingItem} />
    ) : null;
  }, [ItemSeparatorComponent, item, trailingItem]);

  //console.log("ViewHolder re-render", index);

  const children = useMemo(() => {
    return renderItem?.({ item, index, extraData, target }) ?? null;
  }, [item, index, extraData, target, renderItem]);

  const style = {
    flexDirection: horizontal ? "row" : "column",
    position: target === "StickyHeader" ? "relative" : "absolute",
    width: layout.enforcedWidth ? layout.width : undefined,
    height: layout.enforcedHeight ? layout.height : undefined,
    minHeight: layout.minHeight,
    minWidth: layout.minWidth,
    maxHeight: layout.maxHeight,
    maxWidth: layout.maxWidth,
    left: layout.x,
    top: layout.y,
  } as const;

  //TODO: Fix this type issue
  const CompatContainer = (CellRendererComponent ??
    CompatView) as unknown as any;

  return (
    <CompatContainer ref={viewRef} onLayout={onLayout} style={style}>
      {children}
      {separator}
    </CompatContainer>
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
      prevProps.renderItem === nextProps.renderItem &&
      prevProps.CellRendererComponent === nextProps.CellRendererComponent &&
      prevProps.ItemSeparatorComponent === nextProps.ItemSeparatorComponent &&
      prevProps.trailingItem === nextProps.trailingItem &&
      prevProps.horizontal === nextProps.horizontal
    );
  }
);

function areLayoutsEqual(prevLayout: RVLayout, nextLayout: RVLayout): boolean {
  return (
    prevLayout.x === nextLayout.x &&
    prevLayout.y === nextLayout.y &&
    prevLayout.width === nextLayout.width &&
    prevLayout.height === nextLayout.height &&
    prevLayout.enforcedWidth === nextLayout.enforcedWidth &&
    prevLayout.enforcedHeight === nextLayout.enforcedHeight &&
    prevLayout.minWidth === nextLayout.minWidth &&
    prevLayout.minHeight === nextLayout.minHeight &&
    prevLayout.maxWidth === nextLayout.maxWidth &&
    prevLayout.maxHeight === nextLayout.maxHeight
  );
}
