import type { RVLayout } from "./recyclerview/layout-managers/LayoutManager";
import { RecyclerViewProps } from "./recyclerview/RecyclerViewProps";
import { CompatScroller } from "./recyclerview/components/CompatScroller";

/**
 * Base parameters for scrolling to the edges of the list.
 */
export interface ScrollToEdgeParams {
  /** Whether the scroll should be animated */
  animated?: boolean;
}

/**
 * Parameters for scrolling to a specific position in the list.
 * Extends ScrollToEdgeParams to include view positioning options.
 */
export interface ScrollToParams extends ScrollToEdgeParams {
  /** Position of the target item relative to the viewport (0 = top, 0.5 = center, 1 = bottom) */
  viewPosition?: number;
  /** Additional offset to apply after viewPosition calculation */
  viewOffset?: number;
}

/**
 * Parameters for scrolling to a specific offset in the list.
 * Used when you want to scroll to an exact pixel position.
 */
export interface ScrollToOffsetParams extends ScrollToParams {
  /** The pixel offset to scroll to */
  offset: number;
  /**
   * If true, the first item offset will not be added to the offset calculation.
   * First offset represents header size or top padding.
   */
  skipFirstItemOffset?: boolean;
}

/**
 * Parameters for scrolling to a specific index in the list.
 * Used when you want to scroll to a specific item by its position in the data array.
 */
export interface ScrollToIndexParams extends ScrollToParams {
  /** The index of the item to scroll to */
  index: number;
}

/**
 * Parameters for scrolling to a specific item in the list.
 * Used when you want to scroll to a specific item by its data value.
 */
export interface ScrollToItemParams<T> extends ScrollToParams {
  /** The item to scroll to */
  item: T;
}

/**
 * Interface for FlashList's ref object that provides imperative methods
 * for controlling list behavior.
 *
 * Usage example:
 * ```tsx
 * const listRef = useRef<FlashListRef<ItemType>>(null);
 *
 * // Later in your component
 * <FlashList
 *   ref={listRef}
 *   data={data}
 *   renderItem={renderItem}
 * />
 *
 * // Somewhere else in your component
 * listRef.current?.scrollToIndex({ index: 5, animated: true });
 * ```
 */
export interface FlashListRef<T> {
  /**
   * Get access to current props
   */
  props: RecyclerViewProps<T>;
  /**
   * Scrolls the list to a specific offset position.
   *
   * Use this method when you want precise control over the scroll position in pixels
   * rather than by item index.
   *
   * @param params - Parameters for scrolling to offset
   * @param params.offset - The pixel offset to scroll to
   * @param params.animated - Whether the scroll should be animated (default: false)
   * @param params.skipFirstItemOffset - If true, the first item offset (headers/padding)
   *                                    will not be included in calculation (default: true)
   *
   * @example
   * // Scroll to 200px from the top/left
   * listRef.current?.scrollToOffset({ offset: 200, animated: true });
   */
  scrollToOffset: (params: ScrollToOffsetParams) => void;

  /**
   * Makes the scroll indicators flash momentarily.
   *
   * Useful to indicate to users that there is more content to scroll.
   *
   * @example
   * listRef.current?.flashScrollIndicators();
   */
  flashScrollIndicators: () => void;

  /**
   * Returns the underlying native scroll view reference.
   *
   * Use this when you need direct access to the native scroll component.
   * This is generally not recommended for regular use.
   *
   * @returns The native scroll view reference
   */
  getNativeScrollRef: () => CompatScroller | null;

  /**
   * Returns a reference to the scroll responder.
   *
   * Useful for more advanced scroll handling and integrations.
   *
   * @returns The scroll responder
   */
  getScrollResponder: CompatScroller["getScrollResponder"];

  /**
   * Returns the underlying scrollable node.
   *
   * Primarily used for platform-specific integrations.
   *
   * @returns The scrollable node
   */
  getScrollableNode: () => any;

  /**
   * Scrolls to the end of the list.
   *
   * @param params - Optional parameters for scrolling
   * @param params.animated - Whether the scroll should be animated (default: false)
   *
   * @example
   * // Animate scroll to the end of the list
   * listRef.current?.scrollToEnd({ animated: true });
   */
  scrollToEnd: (params?: ScrollToEdgeParams) => void;

  /**
   * Scrolls to the top (or start) of the list.
   *
   * @param params - Optional parameters for scrolling
   * @param params.animated - Whether the scroll should be animated (default: false)
   *
   * @example
   * // Smoothly scroll to the top
   * listRef.current?.scrollToTop({ animated: true });
   */
  scrollToTop: (params?: ScrollToEdgeParams) => void;

  /**
   * Scrolls to a specific index in the list.
   *
   * This is the most common method to scroll to a particular item.
   *
   * @param params - Parameters for scrolling to index
   * @param params.index - The index of the item to scroll to
   * @param params.animated - Whether the scroll should be animated (default: false)
   * @param params.viewPosition - Position of the item within the visible area:
   *                              0 = top/left, 0.5 = center, 1 = bottom/right (default: 0)
   * @param params.viewOffset - Additional offset to apply after viewPosition calculation
   *
   * @returns A Promise that resolves when the scroll operation is complete
   *
   * @example
   * // Scroll to the 5th item (index 4) and center it
   * listRef.current?.scrollToIndex({
   *   index: 4,
   *   animated: true,
   *   viewPosition: 0.5
   * });
   */
  scrollToIndex: (params: ScrollToIndexParams) => Promise<void>;

  /**
   * Scrolls to a specific item in the list.
   *
   * Similar to scrollToIndex, but works with the item reference instead of its index.
   * Useful when you have a reference to an item but don't know its index.
   *
   * @param params - Parameters for scrolling to item
   * @param params.item - The item object to scroll to
   * @param params.animated - Whether the scroll should be animated (default: false)
   * @param params.viewPosition - Position of the item within the visible area:
   *                              0 = top/left, 0.5 = center, 1 = bottom/right (default: 0)
   * @param params.viewOffset - Additional offset to apply after viewPosition calculation
   *
   * @example
   * // Scroll to a specific item
   * const targetItem = data[10];
   * listRef.current?.scrollToItem({
   *   item: targetItem,
   *   animated: true
   * });
   */
  scrollToItem: (params: ScrollToItemParams<T>) => void;

  /**
   * Returns the offset of the first item (accounts for header/padding).
   *
   * Useful when implementing custom scroll behavior or calculating positions.
   *
   * @returns The pixel offset of the first item
   */
  getFirstItemOffset: () => number;

  /**
   * Returns the current viewport dimensions.
   *
   * @returns An object with width and height properties representing viewport size
   */
  getWindowSize: () => { width: number; height: number };

  /**
   * Returns the layout information for a specific item.
   *
   * Use this to get position and size information for an item at a given index.
   *
   * @param index - The index of the item to get layout information for
   * @returns Layout information including x, y, width, and height
   *
   * @example
   * const itemLayout = listRef.current?.getLayout(5);
   * console.log(`Item 5 position: (${itemLayout.x}, ${itemLayout.y})`);
   */
  getLayout: (index: number) => RVLayout | undefined;

  /**
   * Returns the absolute last scroll offset.
   *
   * Useful for implementing custom scroll tracking functionality.
   *
   * @returns The last scroll offset in pixels
   */
  getAbsoluteLastScrollOffset: () => number;

  /**
   * Returns the dimensions of the child container.
   *
   * @returns An object with width and height properties
   */
  getChildContainerDimensions: () => { width: number; height: number };

  /**
   * Marks the list as having been interacted with.
   *
   * Call this method when you want to manually trigger the onViewableItemsChanged
   * callback without an actual scroll event.
   */
  recordInteraction: () => void;

  /**
   * Returns the currently visible item indices.
   *
   * Use this to determine which items are currently visible to the user.
   *
   * @returns An object with startIndex and endIndex properties
   *
   * @example
   * const { startIndex, endIndex } = listRef.current?.getVisibleIndices();
   * console.log(`Visible items: ${startIndex} to ${endIndex}`);
   */
  computeVisibleIndices: () => { startIndex: number; endIndex: number };

  /**
   * Returns the index of the first visible item.
   *
   * Convenience method when you only need the first visible item.
   *
   * @returns The index of the first visible item
   *
   * @example
   * const firstVisibleIndex = listRef.current?.getFirstVisibleIndex();
   */
  getFirstVisibleIndex: () => number;

  /**
   * Forces recalculation of viewable items (vieability callbacks).
   *
   * Call this after any operation that might affect item visibility but
   * doesn't trigger a scroll event.
   *
   * @example
   * // After manually changing item sizes
   * listRef.current?.recomputeViewableItems();
   */
  recomputeViewableItems: () => void;

  /**
   * Disables item recycling in preparation for layout animations.
   *
   * Call this before performing layout animations to prevent visual glitches.
   * Remember to reset disableRecycling after animations complete.
   *
   * @example
   * // Before starting layout animations
   * listRef.current?.prepareForLayoutAnimationRender();
   */
  prepareForLayoutAnimationRender: () => void;

  /**
   * Clears the layout cache on update.
   * Call this when you want to clear the layout cache on update.
   * Can be useful for carousals when orientation changes.
   * This should be called before the render and not in an effect.
   *
   * @example
   * listRef.current?.clearLayoutCacheOnUpdate();
   */
  clearLayoutCacheOnUpdate: () => void;
}
