/**
 * StickyHeaders component manages the sticky header behavior in a FlashList.
 * It handles the animation and positioning of headers that should remain fixed
 * at the top of the list while scrolling.
 */

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
import { RecyclerViewManager } from "../RecyclerViewManager";
import { ViewHolder } from "../ViewHolder";

import { CompatAnimatedView } from "./CompatView";

/**
 * Props for the StickyHeaders component
 * @template TItem - The type of items in the list
 */
export interface StickyHeaderProps<TItem> {
  /** Array of indices that should have sticky headers */
  stickyHeaderIndices: number[];
  /** The data array being rendered */
  data: ReadonlyArray<TItem>;
  /** Animated value tracking scroll position */
  scrollY: Animated.Value;
  /** Function to render each item */
  renderItem: FlashListProps<TItem>["renderItem"];
  /** Ref to access sticky header methods */
  stickyHeaderRef: React.RefObject<StickyHeaderRef>;
  /** Manager for recycler view operations */
  recyclerViewManager: RecyclerViewManager<TItem>;
  /** Additional data to trigger re-renders */
  extraData: FlashListProps<TItem>["extraData"];
}

/**
 * Ref interface for StickyHeaders component
 */
export interface StickyHeaderRef {
  /** Reports scroll events to update sticky header positions */
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
  const animatedPushStartsAtRef = useRef(
    new Animated.Value(Number.MAX_SAFE_INTEGER)
  );
  const lastPushStartAtValueRef = useRef(Number.MAX_SAFE_INTEGER);

  const animatedHeaderOffset = useMemo(() => {
    // allow only negative values using interpolate
    return Animated.subtract(
      animatedPushStartsAtRef.current,
      scrollY
    ).interpolate({
      inputRange: [-Number.MAX_SAFE_INTEGER, 0],
      outputRange: [-Number.MAX_SAFE_INTEGER, 0],
      extrapolate: "clamp",
    });
  }, [scrollY]);

  const [currentStickyIndex, setCurrentStickyIndex] = useState(-1);

  // Memoize sorted indices based on their Y positions
  const sortedIndices = useMemo(() => {
    return stickyHeaderIndices.sort((first, second) => first - second);
  }, [stickyHeaderIndices]);

  const legthInvalid =
    sortedIndices.length === 0 ||
    recyclerViewManager.getDataLength() <=
      sortedIndices[sortedIndices.length - 1];

  const compute = useCallback(() => {
    if (legthInvalid) {
      return;
    }
    const adjustedScrollOffset = recyclerViewManager.getLastScrollOffset();

    // Binary search for current sticky index
    const currentIndexInArray = findCurrentStickyIndex(
      sortedIndices,
      adjustedScrollOffset,
      (index) => recyclerViewManager.getLayout(index).y
    );

    const newStickyIndex = sortedIndices[currentIndexInArray] ?? -1;
    let newNextStickyIndex = sortedIndices[currentIndexInArray + 1] ?? -1;

    if (newNextStickyIndex > recyclerViewManager.getEngagedIndices().endIndex) {
      newNextStickyIndex = -1;
    }

    const newNextStickyY =
      (recyclerViewManager.tryGetLayout(newNextStickyIndex)?.y ?? 0) +
      recyclerViewManager.firstItemOffset;
    const newCurrentStickyHeight =
      recyclerViewManager.tryGetLayout(newStickyIndex)?.height ?? 0;

    const newPushStartsAt = newNextStickyY - newCurrentStickyHeight;

    if (newNextStickyIndex === -1) {
      lastPushStartAtValueRef.current = Number.MAX_SAFE_INTEGER;
      animatedPushStartsAtRef.current.setValue(Number.MAX_SAFE_INTEGER);
    } else if (newPushStartsAt !== lastPushStartAtValueRef.current) {
      lastPushStartAtValueRef.current = newPushStartsAt;
      animatedPushStartsAtRef.current.setValue(newPushStartsAt);
    }

    if (newStickyIndex !== currentStickyIndex) {
      setCurrentStickyIndex(newStickyIndex);
    }
  }, [legthInvalid, recyclerViewManager, sortedIndices, currentStickyIndex]);

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
    [compute]
  );

  const refHolder = useRef(new Map()).current;

  // Memoize header content
  const headerContent = useMemo(() => {
    return (
      <CompatAnimatedView
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1,
          transform: [{ translateY: animatedHeaderOffset }],
        }}
      >
        {currentStickyIndex !== -1 ? (
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
        ) : null}
      </CompatAnimatedView>
    );
  }, [
    currentStickyIndex,
    data,
    renderItem,
    extraData,
    refHolder,
    animatedHeaderOffset,
  ]);

  return headerContent;
};

/**
 * Binary search utility to find the current sticky header index based on scroll position
 * @param sortedIndices - Array of indices sorted by Y position
 * @param adjustedValue - Current scroll position
 * @param getY - Function to get Y position for an index
 * @returns Index of the current sticky header
 */
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
