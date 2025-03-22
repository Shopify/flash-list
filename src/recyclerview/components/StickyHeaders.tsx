import React, {
  useRef,
  useState,
  useMemo,
  useImperativeHandle,
  useCallback,
} from "react";
import { Animated, NativeScrollEvent } from "react-native";
import { FlashListProps } from "../..";
import { CompatAnimatedView } from "./CompatView";
import { RecyclerViewManager } from "../RecyclerViewManager";
import { ViewHolder } from "../ViewHolder";
export interface StickyHeaderProps<TItem> {
  stickyHeaderIndices: number[];
  data: readonly TItem[];
  scrollY: Animated.Value;
  renderItem: FlashListProps<TItem>["renderItem"];
  stickyHeaderRef: React.RefObject<StickyHeaderRef>;
  recyclerViewManager: RecyclerViewManager<TItem>;
  extraData?: FlashListProps<TItem>["extraData"];
}
export interface StickyHeaderRef {
  reportScrollEvent: (event: NativeScrollEvent) => void;
}

export const StickyHeaders = <TItem,>({
  stickyHeaderIndices,
  renderItem,
  stickyHeaderRef,
  recyclerViewManager,
  scrollY,
  data,
  extraData,
}: StickyHeaderProps<TItem>) => {
  const [stickyIndices, setStickyIndices] = useState<{
    current: number;
    next?: number;
  }>({ current: -1 });

  const { current: currentStickyIndex, next: nextStickyIndex } = stickyIndices;
  const hasLayout = recyclerViewManager.hasLayout();

  // Memoize sorted indices based on their Y positions
  const sortedIndices = useMemo(() => {
    if (!hasLayout) {
      return [];
    }
    return [...stickyHeaderIndices].sort((a, b) => {
      const aY = recyclerViewManager.getLayout(a).y;
      const bY = recyclerViewManager.getLayout(b).y;
      return aY - bY;
    });
  }, [stickyHeaderIndices, recyclerViewManager, hasLayout]);

  const compute = useCallback(() => {
    const adjustedValue = recyclerViewManager.getLastScrollOffset();

    // Binary search for current sticky index
    const newStickyIndex = findCurrentStickyIndex(
      sortedIndices,
      adjustedValue,
      (index) => recyclerViewManager.getLayout(index).y
    );

    // Binary search for next sticky index
    let newNextStickyIndex = findNextStickyIndex(
      sortedIndices,
      adjustedValue,
      (index) => recyclerViewManager.getLayout(index).y
    );

    if (
      (newNextStickyIndex ?? 0) >
      recyclerViewManager.getEngagedIndices().endIndex
    ) {
      newNextStickyIndex = undefined;
    }

    if (
      newStickyIndex !== currentStickyIndex ||
      newNextStickyIndex !== nextStickyIndex
    ) {
      setStickyIndices({
        current: newStickyIndex,
        next: newNextStickyIndex,
      });
    }
  }, [currentStickyIndex, nextStickyIndex, recyclerViewManager, sortedIndices]);

  compute();

  // Optimized scroll handler using binary search pattern
  useImperativeHandle(
    stickyHeaderRef,
    () => ({
      reportScrollEvent: () => {
        compute();
      },
    }),
    [
      stickyHeaderIndices,
      recyclerViewManager,
      currentStickyIndex,
      nextStickyIndex,
    ]
  );

  const refHolder = useRef(new Map()).current;

  // Memoize translateY calculation
  const translateY = useMemo(() => {
    if (currentStickyIndex === -1 || !nextStickyIndex) {
      return new Animated.Value(0);
    }

    const currentLayout = recyclerViewManager.getLayout(currentStickyIndex);
    const nextLayout = recyclerViewManager.getLayout(nextStickyIndex);

    const pushStartsAt = nextLayout.y - currentLayout.height;

    return scrollY.interpolate({
      inputRange: [
        pushStartsAt + recyclerViewManager.firstItemOffset,
        nextLayout.y + recyclerViewManager.firstItemOffset,
      ],
      outputRange: [0, -currentLayout.height],
      extrapolate: "clamp",
    });
  }, [currentStickyIndex, nextStickyIndex, recyclerViewManager, scrollY]);

  // Memoize header content
  const headerContent = useMemo(() => {
    if (currentStickyIndex === -1) return null;

    return (
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
          index={currentStickyIndex}
          item={data[currentStickyIndex]}
          renderItem={renderItem}
          layout={{ x: 0, y: 0, width: 0, height: 0 }}
          refHolder={refHolder}
          extraData={extraData}
          trailingItem={null}
          target="StickyHeader"
        />
      </CompatAnimatedView>
    );
  }, [currentStickyIndex, data, renderItem, extraData, refHolder, translateY]);

  return headerContent;
};

// Binary search utilities
function findCurrentStickyIndex(
  sortedIndices: number[],
  adjustedValue: number,
  getY: (index: number) => number
): number {
  let left = 0;
  let right = sortedIndices.length - 1;
  let result = -1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const currentY = getY(sortedIndices[mid]);

    if (currentY <= adjustedValue) {
      result = sortedIndices[mid];
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return result;
}

function findNextStickyIndex(
  sortedIndices: number[],
  adjustedValue: number,
  getY: (index: number) => number
): number | undefined {
  let left = 0;
  let right = sortedIndices.length - 1;
  let result: number | undefined;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const currentY = getY(sortedIndices[mid]);

    if (currentY > adjustedValue) {
      result = sortedIndices[mid];
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }

  return result;
}

/*
 * Sliding animation for sticky headers:
 * When the next header pushes the current one up, we translate the current header
 * upward based on how much the next header has entered the sticky header zone.
 */
