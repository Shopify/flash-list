/**
 * StickyFooters component manages the sticky footer behavior in a FlashList.
 * It handles the animation and positioning of footers that should remain fixed
 * at the bottom of the list while scrolling.
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
import { PlatformConfig } from "../../native/config/PlatformHelper";
import { RecyclerViewManager } from "../RecyclerViewManager";
import { ViewHolder } from "../ViewHolder";

import { CompatAnimatedView } from "./CompatView";

/**
 * Props for the StickyFooters component
 * @template TItem - The type of items in the list
 */
export interface StickyFooterProps<TItem> {
  /** Array of indices that should have sticky footers */
  stickyFooterIndices: number[];
  /** Offset from the bottom where sticky footer should stick (in pixels) */
  stickyFooterOffset: number;
  /** The data array being rendered */
  data: ReadonlyArray<TItem>;
  /** Animated value tracking scroll position */
  scrollY: Animated.Value;
  /** Function to render each item */
  renderItem: FlashListProps<TItem>["renderItem"];
  /** Ref to access sticky footer methods */
  stickyFooterRef: React.RefObject<StickyFooterRef>;
  /** Manager for recycler view operations */
  recyclerViewManager: RecyclerViewManager<TItem>;
  /** Additional data to trigger re-renders */
  extraData: FlashListProps<TItem>["extraData"];
  /** Called with the current and previous index when the sticky footer changes */
  onChangeStickyIndex?: (current: number, previous: number) => void;
  /** Whether the list is inverted */
  inverted?: FlashListProps<TItem>["inverted"];
  /** zIndex applied to the sticky footer container */
  stickyFooterZIndex?: number;
}

/**
 * Ref interface for StickyFooters component
 */
export interface StickyFooterRef {
  /** Reports scroll events to update sticky footer positions */
  reportScrollEvent: (event: NativeScrollEvent) => void;
}

interface StickyFooterState {
  currentStickyIndex: number;
  pushStartsAt: number;
}

export const StickyFooters = <TItem,>({
  stickyFooterIndices,
  stickyFooterOffset,
  renderItem,
  stickyFooterRef,
  recyclerViewManager,
  scrollY,
  data,
  extraData,
  onChangeStickyIndex,
  inverted,
  stickyFooterZIndex = 2,
}: StickyFooterProps<TItem>) => {
  const [stickyFooterState, setStickyFooterState] = useState<StickyFooterState>(
    {
      currentStickyIndex: -1,
      pushStartsAt: Number.MIN_SAFE_INTEGER,
    }
  );

  const { currentStickyIndex, pushStartsAt } = stickyFooterState;

  // sort indices and memoize compute
  const sortedIndices = useMemo(() => {
    return [...stickyFooterIndices].sort((first, second) => first - second);
  }, [stickyFooterIndices]);

  const lengthInvalid =
    sortedIndices.length === 0 ||
    recyclerViewManager.getDataLength() <=
      sortedIndices[sortedIndices.length - 1];

  const compute = useCallback(() => {
    if (lengthInvalid) {
      return;
    }

    // Scroll offset relative to the item container (firstItemOffset already subtracted),
    // so it is compared against layout y values without adding firstItemOffset back.
    const adjustedScrollOffset = recyclerViewManager.getLastScrollOffset();
    const windowSize = recyclerViewManager.getWindowSize();
    const bottomLine =
      adjustedScrollOffset + windowSize.height - stickyFooterOffset;
    // Binary search for current sticky index
    const currentIndexInArray = findCurrentStickyIndex(
      sortedIndices,
      bottomLine,
      (index) => recyclerViewManager.getLayout(index).y,
      (index) => recyclerViewManager.getLayout(index).height
    );

    const newStickyIndex = sortedIndices[currentIndexInArray] ?? -1;
    let newPrevStickyIndex = sortedIndices[currentIndexInArray - 1] ?? -1;

    // Only push when the previous footer is rendered, otherwise its layout may be an estimate
    if (
      newPrevStickyIndex < recyclerViewManager.getEngagedIndices().startIndex
    ) {
      newPrevStickyIndex = -1;
    }

    const newCurrentStickyHeight =
      recyclerViewManager.tryGetLayout(newStickyIndex)?.height ?? 0;

    // Calculate when the previous sticky footer should start pushing the current one down
    const newPrevStickyY =
      newPrevStickyIndex === -1
        ? Number.MIN_SAFE_INTEGER
        : (recyclerViewManager.tryGetLayout(newPrevStickyIndex)?.y ?? 0) +
          recyclerViewManager.firstItemOffset;

    const prevHeight =
      newPrevStickyIndex === -1
        ? 0
        : recyclerViewManager.tryGetLayout(newPrevStickyIndex)?.height ?? 0;

    // bottom of previous footer (content space)
    const prevBottom = newPrevStickyY + prevHeight;

    // push must start when prevBottom reaches top of sticky footer area
    const newPushStartsAt =
      newPrevStickyIndex === -1
        ? Number.MIN_SAFE_INTEGER
        : prevBottom -
          (windowSize.height - stickyFooterOffset - newCurrentStickyHeight);

    if (
      newStickyIndex !== currentStickyIndex ||
      newPushStartsAt !== pushStartsAt
    ) {
      setStickyFooterState({
        currentStickyIndex: newStickyIndex,
        pushStartsAt: newPushStartsAt,
      });
    }

    if (newStickyIndex !== currentStickyIndex) {
      onChangeStickyIndex?.(newStickyIndex, currentStickyIndex);
    }
  }, [
    lengthInvalid,
    recyclerViewManager,
    sortedIndices,
    currentStickyIndex,
    pushStartsAt,
    onChangeStickyIndex,
    stickyFooterOffset,
  ]);

  useEffect(() => {
    compute();
  }, [compute]);

  // Optimized scroll handler using binary search pattern
  useImperativeHandle(
    stickyFooterRef,
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
        inputRange: [pushStartsAt - currentStickyHeight, pushStartsAt],
        outputRange: [currentStickyHeight, 0],
        extrapolate: "clamp",
      }),
      opacity:
        stickyFooterOffset > 0
          ? scrollY.interpolate({
              inputRange: [pushStartsAt - currentStickyHeight, pushStartsAt],
              outputRange: [0, 1],
              extrapolate: "clamp",
            })
          : undefined,
    };
  }, [
    recyclerViewManager,
    currentStickyIndex,
    scrollY,
    pushStartsAt,
    stickyFooterOffset,
  ]);

  // Memoize footer content
  const footerContent = useMemo(() => {
    return (
      <CompatAnimatedView
        style={{
          position: "absolute",
          bottom: stickyFooterOffset,
          left: 0,
          right: 0,
          zIndex: stickyFooterZIndex,
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
            target="StickyFooter"
            hidden={false}
            inverted={inverted}
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
    stickyFooterOffset,
    stickyFooterZIndex,
    inverted,
  ]);

  if (PlatformConfig.isRN083OrAbove && currentStickyIndex === -1) {
    return null;
  }

  return footerContent;
};

/**
 * Binary search utility to find the current sticky footer index based on scroll position
 * @param sortedIndices - Array of indices sorted by Y position
 * @param adjustedValue - Bottom edge of the sticky footer area in content coordinates
 * @param getY - Function to get Y position for an index
 * @param getHeight - Function to get height for an index
 * @returns Index of the current sticky footer
 */
function findCurrentStickyIndex(
  sortedIndices: number[],
  adjustedValue: number,
  getY: (index: number) => number,
  getHeight: (index: number) => number
): number {
  let left = 0;
  let right = sortedIndices.length - 1;
  let ans = -1;

  while (left <= right) {
    const mid = (left + right) >> 1;
    const y = getY(sortedIndices[mid]);
    const height = getHeight(sortedIndices[mid]);
    const derivedHeight = adjustedValue - height;

    if (derivedHeight <= y) {
      ans = mid;
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  return ans;
}
