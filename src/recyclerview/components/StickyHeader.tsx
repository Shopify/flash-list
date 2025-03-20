import React, { useRef, useEffect } from "react";
import { Animated, View } from "react-native";
import { FlashListProps } from "../..";
import { CompatAnimatedView } from "./CompatView";
import { RecyclerViewManager } from "../RecyclerViewManager";
import { ViewHolder } from "../ViewHolder";
export interface StickyHeaderProps<TItem> {
  stickyHeaderIndices: number[];
  data: TItem[];
  renderItem: FlashListProps<TItem>["renderItem"];
  scrollY: Animated.Value;
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
  const translateY = useRef(new Animated.Value(0)).current;
  // Calculate current sticky header

  let currentSticky = -1;
  const currentScrollY = recyclerViewManager.getLastScrollOffset();

  for (let i = 0; i < stickyHeaderIndices.length; i++) {
    const stickyHeaderIndex = stickyHeaderIndices[i];
    const stickyHeaderOffset = recyclerViewManager.getLayout(stickyHeaderIndex);
    if (stickyHeaderOffset.y <= currentScrollY) {
      currentSticky = stickyHeaderIndex;
    }
  }

  // Calculate next sticky header
  let nextSticky;
  for (let i = 0; i < stickyHeaderIndices.length; i++) {
    const stickyHeaderIndex = stickyHeaderIndices[i];
    const stickyHeaderOffset = recyclerViewManager.getLayout(stickyHeaderIndex);
    if (stickyHeaderOffset.y > currentScrollY) {
      nextSticky = stickyHeaderIndex;
      break;
    }
  }

  if (nextSticky !== undefined) {
    const nextHeaderLayout = recyclerViewManager.getLayout(nextSticky);
    const currentHeaderLayout = recyclerViewManager.getLayout(currentSticky);
    const currentHeaderHeight = currentHeaderLayout.height || 0;

    // Calculate how much the next header has pushed into the current sticky header
    const pushDistance =
      currentScrollY + currentHeaderHeight - nextHeaderLayout.y;

    if (pushDistance > 0) {
      // When next header starts pushing the current one
      translateY.setValue(-Math.min(pushDistance, currentHeaderHeight));
    } else {
      translateY.setValue(0);
    }
  }

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
          transform: [{ translateY }],
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
    )
  );
};

/*
 * Sliding animation for sticky headers:
 * When the next header pushes the current one up, we translate the current header
 * upward based on how much the next header has entered the sticky header zone.
 */
