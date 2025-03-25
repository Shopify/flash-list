import React, {
  useRef,
  useState,
  useMemo,
  useImperativeHandle,
  useCallback,
  useEffect,
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
  extraData: FlashListProps<TItem>["extraData"];
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
    currentStickyIndex: number;
    nextStickyIndex: number;
  }>({ currentStickyIndex: -1, nextStickyIndex: -1 });

  const { currentStickyIndex, nextStickyIndex } = stickyIndices;
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
    const currentIndexInArray = findCurrentStickyIndex(
      sortedIndices,
      adjustedValue,
      (index) => recyclerViewManager.getLayout(index).y
    );

    const newStickyIndex = sortedIndices[currentIndexInArray] ?? -1;
    let newNextStickyIndex = sortedIndices[currentIndexInArray + 1] ?? -1;

    if (newNextStickyIndex > recyclerViewManager.getEngagedIndices().endIndex) {
      newNextStickyIndex = -1;
    }

    if (
      newStickyIndex !== currentStickyIndex ||
      newNextStickyIndex !== nextStickyIndex
    ) {
      setStickyIndices({
        currentStickyIndex: newStickyIndex,
        nextStickyIndex: newNextStickyIndex,
      });
    }
  }, [currentStickyIndex, nextStickyIndex, recyclerViewManager, sortedIndices]);

  useEffect(() => {
    compute();
  }, [compute]);

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
    if (currentStickyIndex === -1 || nextStickyIndex === -1) {
      return scrollY.interpolate({
        inputRange: [0, Infinity],
        outputRange: [0, 0],
        extrapolate: "clamp",
      });
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
      result = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return result;
}
/*
 * Sliding animation for sticky headers:
 * When the next header pushes the current one up, we translate the current header
 * upward based on how much the next header has entered the sticky header zone.
 */
