import React, { useEffect, useImperativeHandle, useLayoutEffect } from "react";
import { ViewHolder, ViewHolderProps } from "./ViewHolder";
import { RVDimension, RVLayout } from "./layout-managers/LayoutManager";
import { FlashListProps } from "../FlashListProps";
import { CompatView } from "./components/CompatView";
import { useRecyclerViewContext } from "./RecyclerViewContextProvider";

export interface ViewHolderCollectionProps<TItem> {
  data: FlashListProps<TItem>["data"];
  renderStack: Map<number, string>;
  getLayout: (index: number) => RVLayout;
  viewHolderCollectionRef: React.Ref<ViewHolderCollectionRef>;
  refHolder: ViewHolderProps<TItem>["refHolder"];
  onSizeChanged: ViewHolderProps<TItem>["onSizeChanged"];
  renderItem: FlashListProps<TItem>["renderItem"];
  extraData: any;
  getChildContainerLayout: () => RVDimension | undefined;
  childContainerViewRef?: React.RefObject<CompatView>;
  onCommitLayoutEffect?: () => void;
  onCommitEffect?: () => void;
  CellRendererComponent?: FlashListProps<TItem>["CellRendererComponent"];
  ItemSeparatorComponent?: FlashListProps<TItem>["ItemSeparatorComponent"];
  horizontal: FlashListProps<TItem>["horizontal"];
}

export interface ViewHolderCollectionRef {
  commitLayout: () => void;
}

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
    childContainerViewRef,
    onCommitLayoutEffect,
    CellRendererComponent,
    ItemSeparatorComponent,
    onCommitEffect,
    horizontal,
  } = props;

  const [renderId, setRenderId] = React.useState(0);

  const containerLayout = getChildContainerLayout();

  // TODO: guard againt precision issues
  const fixedContainerSize = horizontal
    ? containerLayout?.height
    : containerLayout?.width;

  const recyclerViewContext = useRecyclerViewContext();

  useLayoutEffect(() => {
    if (renderId > 0) {
      console.log(
        "parent layout trigger due to child container size change",
        fixedContainerSize
      );
      recyclerViewContext?.layout();
    }
  }, [fixedContainerSize]);

  useLayoutEffect(() => {
    if (renderId > 0) {
      onCommitLayoutEffect?.();
    }
  }, [renderId]);

  useEffect(() => {
    if (renderId > 0) {
      onCommitEffect?.();
    }
  }, [renderId]);

  // Expose forceUpdate through ref
  useImperativeHandle(viewHolderCollectionRef, () => ({
    commitLayout: () => {
      // This will trigger a re-render of the component
      setRenderId((prev) => prev + 1);
    },
  }));

  const hasData = data && data.length > 0;

  const containerStyle = {
    width: horizontal ? containerLayout?.width : undefined,
    height: containerLayout?.height,
  };

  return (
    <CompatView
      // TODO: Take care of web scroll bar here
      ref={childContainerViewRef}
      style={hasData && containerStyle}
    >
      {containerLayout &&
        hasData &&
        Array.from(renderStack, ([index, reactKey]) => {
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
