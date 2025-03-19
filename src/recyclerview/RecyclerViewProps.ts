import { FlashListProps } from "../FlashListProps";
import { ScrollViewProps, ViewStyle } from "react-native";

export interface RecyclerViewProps<TItem>
  extends Omit<
    FlashListProps<TItem>,
    "contentContainerStyle" | "renderScrollComponent"
  > {
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

  renderScrollComponent?: (props: ScrollViewProps) => React.ReactNode;

  contentContainerStyle?: ScrollViewProps["contentContainerStyle"];

  viewabilityConfig?: FlashListProps<TItem>["viewabilityConfig"];
  onViewableItemsChanged?: FlashListProps<TItem>["onViewableItemsChanged"];
  viewabilityConfigCallbackPairs?: FlashListProps<TItem>["viewabilityConfigCallbackPairs"];

  onScroll?: FlashListProps<TItem>["onScroll"];
  disableRecycling?: boolean;
  /**
   * Style for the RecyclerView's parent container.
   */
  style?: ViewStyle;
}
