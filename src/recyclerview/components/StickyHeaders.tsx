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
  /** Offset from the top where sticky headers should stick (in pixels) */
  stickyHeaderOffset: number;
  /** Sticky header change handler */
  onChangeStickyIndex: (index: number) => void;
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

interface StickyHeaderState {
  currentStickyIndex: number;
  pushStartsAt: number;
}

export const StickyHeaders = <TItem,>({
  stickyHeaderIndices,
  stickyHeaderOffset,
  renderItem,
  stickyHeaderRef,
  recyclerViewManager,
  scrollY,
  data,
  extraData,
  onChangeStickyIndex,
}: StickyHeaderProps<TItem>) => {
  const [stickyHeaderState, setStickyHeaderState] = useState<StickyHeaderState>(
    {
      currentStickyIndex: -1,
      pushStartsAt: Number.MAX_SAFE_INTEGER,
    }
  );

  const { currentStickyIndex, pushStartsAt } = stickyHeaderState;

  // sort indices and memoize compute
  const sortedIndices = useMemo(() => {
    return [...stickyHeaderIndices].sort((first, second) => first - second);
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
      adjustedScrollOffset + stickyHeaderOffset,
      (index) => recyclerViewManager.getLayout(index).y
    );

    const newStickyIndex = sortedIndices[currentIndexInArray] ?? -1;
    let newNextStickyIndex = sortedIndices[currentIndexInArray + 1] ?? -1;

    if (newNextStickyIndex > recyclerViewManager.getEngagedIndices().endIndex) {
      newNextStickyIndex = -1;
    }

    // Calculate when the next sticky header should start pushing the current one
    // The next header starts pushing when it reaches the bottom of the current sticky header
    const newNextStickyY =
      newNextStickyIndex === -1
        ? Number.MAX_SAFE_INTEGER
        : (recyclerViewManager.tryGetLayout(newNextStickyIndex)?.y ?? 0) +
          recyclerViewManager.firstItemOffset;
    const newCurrentStickyHeight =
      recyclerViewManager.tryGetLayout(newStickyIndex)?.height ?? 0;

    // Push should start when the next header reaches the bottom of the current sticky header
    const newPushStartsAt = newNextStickyY - newCurrentStickyHeight;

    if (
      newStickyIndex !== currentStickyIndex ||
      newPushStartsAt !== pushStartsAt
    ) {
      setStickyHeaderState({
        currentStickyIndex: newStickyIndex,
        pushStartsAt: newPushStartsAt - stickyHeaderOffset,
      });
    }

    if (newStickyIndex !== currentStickyIndex) {
      onChangeStickyIndex?.(newStickyIndex);
    }
  }, [
    legthInvalid,
    recyclerViewManager,
    sortedIndices,
    currentStickyIndex,
    pushStartsAt,
    onChangeStickyIndex,
    stickyHeaderOffset,
  ]);

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

  const { translateY, opacity } = useMemo(() => {
    const currentStickyHeight =
      recyclerViewManager.tryGetLayout(currentStickyIndex)?.height ?? 0;

    return {
      translateY: scrollY.interpolate({
        inputRange: [pushStartsAt, pushStartsAt + currentStickyHeight],
        outputRange: [0, -currentStickyHeight],
        extrapolate: "clamp",
      }),
      opacity:
        stickyHeaderOffset > 0
          ? scrollY.interpolate({
              inputRange: [pushStartsAt, pushStartsAt + currentStickyHeight],
              outputRange: [1, 0],
              extrapolate: "clamp",
            })
          : undefined,
    };
  }, [
    recyclerViewManager,
    currentStickyIndex,
    scrollY,
    pushStartsAt,
    stickyHeaderOffset,
  ]);

  // Memoize header content
  const headerContent = useMemo(() => {
    return (
      <CompatAnimatedView
        style={{
          position: "absolute",
          top: stickyHeaderOffset,
          left: 0,
          right: 0,
          zIndex: 2,
          transform: [{ translateY }],
          opacity,
        }}
      >
        {currentStickyIndex !== -1 && currentStickyIndex < data.length ? (
          <ViewHolder
            index={currentStickyIndex}
            item={data[currentStickyIndex]}
            renderItem={renderItem}
            layout={{ x: 0, y: 0, width: 0, height: 0 }}
            refHolder={refHolder}
            extraData={extraData}
            trailingItem={null}
            target="StickyHeader"
            hidden={false}
          />
        ) : null}
      </CompatAnimatedView>
    );
  }, [
    translateY,
    opacity,
    currentStickyIndex,
    data,
    renderItem,
    refHolder,
    extraData,
    stickyHeaderOffset,
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
