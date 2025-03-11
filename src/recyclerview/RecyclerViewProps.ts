import { FlashListProps } from "../FlashListProps";
import { ScrollViewProps } from "react-native";

export interface RecyclerViewProps<TItem> {
  horizontal?: FlashListProps<TItem>["horizontal"];
  data: FlashListProps<TItem>["data"];
  numColumns?: FlashListProps<TItem>["numColumns"];
  extraData?: FlashListProps<TItem>["extraData"];
  masonry?: boolean;
  /**
   * If enabled, MasonryFlashList will try to reduce difference in column height by modifying item order.
   */
  optimizeItemArrangement?: boolean; //TODO: Check if this breaks on item resize or is glitchy
  initialScrollIndex?: FlashListProps<TItem>["initialScrollIndex"];
  onLoad?: FlashListProps<TItem>["onLoad"];
  renderItem: FlashListProps<TItem>["renderItem"];
  keyExtractor?: FlashListProps<TItem>["keyExtractor"];
  getItemType?: FlashListProps<TItem>["getItemType"];
  overrideItemLayout?: FlashListProps<TItem>["overrideItemLayout"];
  drawDistance?: FlashListProps<TItem>["drawDistance"];
  /**
   * Each cell is rendered using this element.
   * Can be a React Component Class, or a function component.
   * Ensure that the original `props` are passed to the component.
   * The `props` will include the following:
   * - `onLayout`: Method for updating data about the cell layout
   * - `index`: Index of the cell in the list, you can use this to query data if needed
   * - `style`: Style of the cell, including:
   *   - `position`: Value of this will be `absolute` as that's how cells are positioned
   *   - `left`: Determines position of the element on x axis
   *   - `top`: Determines position of the element on y axis
   *   - `width`: Determines width of the element (present when list is vertical)
   *   - `height`: Determines height of the element (present when list is horizontal)
   */
  CellRendererComponent?: React.ComponentType<any> | undefined;
  /**
   * For debugging and exception use cases, internal props will be overriden with these values if used
   */
  overrideProps?: Partial<ScrollViewProps>;
  /**
   * If provided, a standard RefreshControl will be added for "Pull to Refresh" functionality.
   * Make sure to also set the refreshing prop correctly.
   */
  onRefresh?: FlashListProps<TItem>["onRefresh"];
  /**
   * Set this true while waiting for new data from a refresh.
   */
  refreshing?: FlashListProps<TItem>["refreshing"];
  /**
   * Set this when offset is needed for the loading indicator to show correctly.
   * @platform android
   */
  progressViewOffset?: FlashListProps<TItem>["progressViewOffset"];
}
