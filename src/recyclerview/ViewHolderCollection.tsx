import React, { useImperativeHandle } from "react";
import { ViewHolder, ViewHolderProps } from "./ViewHolder";
import { RVLayout } from "./layout-managers/LayoutManager";
import { FlashListProps } from "../FlashListProps";

export interface ViewHolderCollectionProps<TItem> {
  data: ReadonlyArray<TItem>;
  renderStack: Map<number, string>;
  getLayout: (index: number) => RVLayout;
  viewHolderCollectionRef: React.Ref<ViewHolderCollectionRef>;
  refHolder: ViewHolderProps<TItem>["refHolder"];
  onSizeChanged: ViewHolderProps<TItem>["onSizeChanged"];
  renderItem: FlashListProps<TItem>["renderItem"];
  extraData: any;
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
  } = props;

  // Expose forceUpdate through ref
  useImperativeHandle(viewHolderCollectionRef, () => ({
    commitLayout: () => {
      // This will trigger a re-render of the component
      setRenderId((prev) => prev + 1);
    },
  }));

  const [_, setRenderId] = React.useState(0);

  return (
    <>
      {Array.from(renderStack, ([index, reactKey]) => {
        const item = data[index];
        return (
          <ViewHolder
            key={reactKey}
            index={index}
            item={item}
            layout={{
              ...getLayout(index),
            }}
            refHolder={refHolder}
            onSizeChanged={onSizeChanged}
            target="Cell"
            renderItem={renderItem}
            extraData={extraData}
          />
        );
      })}
    </>
  );
};
