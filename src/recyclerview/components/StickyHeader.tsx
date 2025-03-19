import React, { useRef } from "react";
import { Animated, View } from "react-native";
import { FlashListProps } from "../..";
import { CompatAnimatedView } from "./CompatView";
import { RecyclerViewManager } from "../RecyclerViewManager";
import { ViewHolder } from "../ViewHolder";
export interface StickyHeaderProps<TItem> {
  stickyHeaderIndices: number[];
  data: TItem[];
  renderItem: FlashListProps<TItem>["renderItem"];
  //scrollY: Animated.Value;
  recyclerViewManager: RecyclerViewManager<TItem>;
  extraData?: FlashListProps<TItem>["extraData"];
}

export const StickyHeader = <TItem,>({
  stickyHeaderIndices,
  renderItem,
  //scrollY,
  recyclerViewManager,
  data,
  extraData,
}: StickyHeaderProps<TItem>) => {
  const headerOffset = useRef(new Animated.Value(0));
  // Calculate current sticky header

  let currentSticky = -1;
  const currentScrollY = recyclerViewManager.getLastScrollOffset();
  console.log(
    "currentScrollY",
    currentScrollY,
    recyclerViewManager.firstItemOffset
  );
  for (let i = 0; i < stickyHeaderIndices.length; i++) {
    const stickyHeaderIndex = stickyHeaderIndices[i];
    const stickyHeaderOffset = recyclerViewManager.getLayout(stickyHeaderIndex);
    if (stickyHeaderOffset.y <= currentScrollY) {
      currentSticky = stickyHeaderIndex;
    }
  }

  console.log("currentSticky", currentSticky);

  //Calculate next sticky header
    let nextSticky;
    for (let i = 0; i < stickyHeaderIndices.length; i++) {
      const stickyHeaderIndex = stickyHeaderIndices[i];
      const stickyHeaderOffset = recyclerViewManager.getLayout(stickyHeaderIndex);
      if (stickyHeaderOffset.y > currentScrollY) {
        nextSticky = stickyHeaderIndex;
        break;
      }
    }

  const offset =

  const refHolder = useRef(
    new Map<number, React.RefObject<View | null>>()
  ).current;

  return (
    currentSticky !== -1 && (
      <CompatAnimatedView
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          transform: [{ translateY: offset }],
      }}
    >
      <ViewHolder
        index={currentSticky}
        item={data[currentSticky]}
        renderItem={renderItem}
        layout={{ x: 0, y: 0, width: 0, height: 0 }}
        refHolder={refHolder}
        extraData={extraData}
        onSizeChanged={() => {}}
        trailingItem={null}
        target="StickyHeader"
      />
    </CompatAnimatedView>
  );
};

/*
 * firstVisibleItem is in sticky list and is greater than current sitckyHeaderIndex
 *
 *
 *
 *
 *
 */
