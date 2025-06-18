/**
 * ViewHolderCollection is a container component that manages multiple ViewHolder instances.
 * It handles the rendering of a collection of list items, manages layout updates,
 * and coordinates with the RecyclerView context for layout changes.
 */

import React, { useEffect, useImperativeHandle, useLayoutEffect } from "react";

import { FlashListProps } from "../FlashListProps";

import { ViewHolder, ViewHolderProps } from "./ViewHolder";
import { RVDimension, RVLayout } from "./layout-managers/LayoutManager";
import { CompatView } from "./components/CompatView";
import { useRecyclerViewContext } from "./RecyclerViewContextProvider";

/**
 * Props interface for the ViewHolderCollection component
 * @template TItem - The type of items in the data array
 */
export interface ViewHolderCollectionProps<TItem> {
  /** The data array to be rendered */
  data: FlashListProps<TItem>["data"];
  /** Map of indices to React keys for each rendered item */
  renderStack: Map<string, { index: number }>;
  /** Function to get layout information for a specific index */
  getLayout: (index: number) => RVLayout;
  /** Ref to control layout updates from parent components */
  viewHolderCollectionRef: React.Ref<ViewHolderCollectionRef>;
  /** Map to store refs for each ViewHolder instance */
  refHolder: ViewHolderProps<TItem>["refHolder"];
  /** Callback when any item's size changes */
  onSizeChanged: ViewHolderProps<TItem>["onSizeChanged"];
  /** Function to render each item */
  renderItem: FlashListProps<TItem>["renderItem"];
  /** Additional data passed to renderItem that can trigger re-renders */
  extraData: any;
  /** Function to get the container's layout dimensions */
  getChildContainerLayout: () => RVDimension | undefined;
  /** Callback after layout effects are committed */
  onCommitLayoutEffect: () => void;
  /** Callback after effects are committed */
  onCommitEffect: () => void;
  /** Optional custom component to wrap each item */
  CellRendererComponent?: FlashListProps<TItem>["CellRendererComponent"];
  /** Optional component to render between items */
  ItemSeparatorComponent?: FlashListProps<TItem>["ItemSeparatorComponent"];
  /** Whether the list is horizontal or vertical */
  horizontal: FlashListProps<TItem>["horizontal"];
  /** Function to get the adjustment margin for the container.
   * For startRenderingFromBottom, we need to adjust the height of the container
   */
  getAdjustmentMargin: () => number;
}

/**
 * Ref interface for ViewHolderCollection that exposes methods to control layout updates
 */
export interface ViewHolderCollectionRef {
  /** Forces a layout update by triggering a re-render */
  commitLayout: () => void;
}

/**
 * ViewHolderCollection component that manages the rendering of multiple ViewHolder instances
 * and handles layout updates for the entire collection
 * @template TItem - The type of items in the data array
 */
export const ViewHolderCollection = <TItem,>(
  props: ViewHolderCollectionProps<TItem>
) => {
  const {
    data,
    renderStack,
    getLayout,
    refHolder,
    onSizeChanged,
    renderItem,
    extraData,
    viewHolderCollectionRef,
    getChildContainerLayout,
    onCommitLayoutEffect,
    CellRendererComponent,
    ItemSeparatorComponent,
    onCommitEffect,
    horizontal,
    getAdjustmentMargin,
  } = props;

  const [renderId, setRenderId] = React.useState(0);

  const containerLayout = getChildContainerLayout();

  const fixedContainerSize = horizontal
    ? containerLayout?.height
    : containerLayout?.width;

  const recyclerViewContext = useRecyclerViewContext();

  useLayoutEffect(() => {
    if (renderId > 0) {
      // console.log(
      //   "parent layout trigger due to child container size change",
      //   fixedContainerSize
      // );
      recyclerViewContext?.layout();
    }
    // we need to run this callback on when fixedContainerSize changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixedContainerSize]);

  useLayoutEffect(() => {
    if (renderId > 0) {
      onCommitLayoutEffect?.();
    }
    // we need to run this callback on when renderId changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderId]);

  useEffect(() => {
    if (renderId > 0) {
      onCommitEffect?.();
    }
    // we need to run this callback on when renderId changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderId]);

  // Expose forceUpdate through ref
  useImperativeHandle(
    viewHolderCollectionRef,
    () => ({
      commitLayout: () => {
        // This will trigger a re-render of the component
        setRenderId((prev) => prev + 1);
      },
    }),
    [setRenderId]
  );

  const hasData = data && data.length > 0;

  const containerStyle = {
    width: horizontal ? containerLayout?.width : undefined,
    height: containerLayout?.height,
    marginTop: horizontal ? undefined : getAdjustmentMargin(),
    marginLeft: horizontal ? getAdjustmentMargin() : undefined,
    // TODO: Temp workaround, useLayoutEffect doesn't block paint in some cases
    // We need to investigate why this is happening
    opacity: renderId > 0 ? 1 : 0,
  };

  // sort by index and log
  // const sortedRenderStack = Array.from(renderStack.entries()).sort(
  //   ([, a], [, b]) => a.index - b.index
  // );
  // console.log(
  //   "sortedRenderStack",
  //   sortedRenderStack.map(([reactKey, { index }]) => {
  //     return `${index} => ${reactKey}`;
  //   })
  // );

  return (
    <CompatView style={hasData && containerStyle}>
      {containerLayout &&
        hasData &&
        Array.from(renderStack.entries(), ([reactKey, { index }]) => {
          const item = data[index];
          const trailingItem = ItemSeparatorComponent
            ? data[index + 1]
            : undefined;
          return (
            <ViewHolder
              key={reactKey}
              index={index}
              item={item}
              trailingItem={trailingItem}
              layout={{
                ...getLayout(index),
              }}
              refHolder={refHolder}
              onSizeChanged={onSizeChanged}
              target="Cell"
              renderItem={renderItem}
              extraData={extraData}
              CellRendererComponent={CellRendererComponent}
              ItemSeparatorComponent={ItemSeparatorComponent}
              horizontal={horizontal}
            />
          );
        })}
    </CompatView>
  );
};
