import { FlashListProps } from "../FlashListProps";
import { ScrollViewProps, ViewStyle } from "react-native";

export interface RecyclerViewProps<TItem>
  extends Omit<
    FlashListProps<TItem>,
    "contentContainerStyle" | "maintainVisibleContentPosition"
  > {
  /*
   * Enable masonry layout.
   */
  masonry?: boolean;
  /**
   * If enabled, MasonryFlashList will try to reduce difference in column height by modifying item order.
   */
  optimizeItemArrangement?: boolean; //TODO: Check if this breaks on item resize or is glitchy

  /**
   * Called once when the scroll position gets within onStartReachedThreshold of the start of the content.
   */
  onStartReached?: FlashListProps<TItem>["onEndReached"];

  /**
   * How far from the start (in units of visible length of the list) the top edge of the
   * list must be from the start of the content to trigger the `onStartReached` callback.
   * Thus a value of 0.5 will trigger `onStartReached` when the start of the content is
   * within half the visible length of the list.
   */
  onStartReachedThreshold?: FlashListProps<TItem>["onEndReachedThreshold"];

  /**
   * Style for the RecyclerView's parent container.
   */
  contentContainerStyle?: ScrollViewProps["contentContainerStyle"];

  /**
   * If true, the RecyclerView will not recycle items.
   */
  disableRecycling?: boolean;
  /**
   * Style for the RecyclerView's parent container.
   * Please avoid anything which can mess size of children in this view. For example, margin is okay but padding is not.
   */
  style?: ViewStyle;

  /**
   * Configuration for maintaining scroll position when content changes.
   * Useful for chat-like interfaces where new messages can be added at the top or bottom.
   */
  maintainVisibleContentPosition?: {
    /**
     * maintainVisibleContentPosition is enabled by default.
     */
    disabled?: boolean;
    /**
     * When content is added at the top, automatically scroll to maintain position if the user is within this threshold of the top
     */
    autoscrollToTopThreshold?: number;
    /**
     * When content is added at the bottom, automatically scroll to maintain position if the user is within this threshold of the bottom
     */
    autoscrollToBottomThreshold?: number;
    /**
     * If true, initial render will start from the bottom of the list, useful for chat-like interfaces when there are only few messages
     */
    startRenderingFromBottom?: boolean;
  };
}
