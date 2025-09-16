/**
 * ViewHolder is a core component in FlashList that manages individual item rendering and layout.
 * It handles the rendering of list items, separators, and manages layout updates for each item.
 * The component is memoized to prevent unnecessary re-renders and includes layout comparison logic.
 */

import type { LayoutChangeEvent, ViewStyle } from "react-native";
import React, {
  type RefObject,
  useCallback,
  useLayoutEffect,
  useRef,
} from "react";

import type { FlashListProps, RenderTarget } from "../FlashListProps";

import type { RVDimension, RVLayout } from "./layout-managers/LayoutManager";
import { CompatView } from "./components/CompatView";

/**
 * Props interface for the ViewHolder component
 * @template TItem - The type of item being rendered in the list
 */
export interface ViewHolderProps<TItem> {
  /** Index of the item in the data array */
  index: number;
  /** Layout information for positioning and sizing the item */
  layout: RVLayout;
  /** Map to store refs for each ViewHolder instance, keyed by index */
  refHolder: Map<number, RefObject<CompatView | null>>;
  /** Additional data passed to renderItem that can trigger re-renders */
  extraData: any;
  /** Specifies the rendering target (e.g., "Cell", "StickyHeader") */
  target: RenderTarget;
  /** The actual item data to be rendered */
  item: TItem;
  /** The next item in the list, used for rendering separators */
  trailingItem: TItem | undefined;
  /** Function to render the item content */
  renderItem: FlashListProps<TItem>["renderItem"];
  /** Optional custom component to wrap each item */
  CellRendererComponent?: FlashListProps<TItem>["CellRendererComponent"];
  /** Optional component to render between items */
  ItemSeparatorComponent?: FlashListProps<TItem>["ItemSeparatorComponent"];
  /** Whether the list is horizontal or vertical */
  horizontal?: FlashListProps<TItem>["horizontal"];
  /** Callback when the item's size changes */
  onSizeChanged?: (index: number, size: RVDimension) => void;
}

/**
 * Creates the main container style for the ViewHolder
 */
const createContainerStyle = (
  layout: RVLayout,
  horizontal = false,
  target: RenderTarget
): ViewStyle => ({
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
});

/**
 * Internal ViewHolder component that handles the actual rendering of list items
 * @template TItem - The type of item being rendered in the list
 */
const ViewHolderInternal = <TItem,>(props: ViewHolderProps<TItem>) => {
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
    horizontal = false,
  } = props;

  // Manage ref lifecycle
  useLayoutEffect(() => {
    refHolder.set(index, viewRef);
    return () => {
      if (refHolder.get(index) === viewRef) {
        refHolder.delete(index);
      }
    };
  }, [index, refHolder]);

  // Handle layout changes
  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      onSizeChanged?.(index, event.nativeEvent.layout);
    },
    [index, onSizeChanged]
  );

  const ContainerComponent = (CellRendererComponent ??
    CompatView) as React.ComponentType<any>;

  return (
    <ContainerComponent
      ref={viewRef}
      onLayout={handleLayout}
      style={createContainerStyle(layout, horizontal ?? false, target)}
      index={index}
    >
      {renderItem?.({ item, index, extraData, target }) ?? null}
      {ItemSeparatorComponent &&
        trailingItem !== undefined &&
        !layout.skipSeparator && (
          <ItemSeparatorComponent
            leadingItem={item}
            trailingItem={trailingItem}
          />
        )}
    </ContainerComponent>
  );
};

/**
 * Memoized ViewHolder component that prevents unnecessary re-renders by comparing props
 * @template TItem - The type of item being rendered in the list
 */
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

/**
 * Compares two RVLayout objects to determine if they are equal
 * Used in the memo comparison function to prevent unnecessary re-renders
 * @param prevLayout - Previous layout object
 * @param nextLayout - Next layout object
 * @returns boolean indicating if layouts are equal
 */
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
    prevLayout.maxHeight === nextLayout.maxHeight &&
    prevLayout.skipSeparator === nextLayout.skipSeparator
  );
}
