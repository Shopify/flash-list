import type React from "react";
import {
  StyleProp,
  ScrollViewProps,
  ViewabilityConfig,
  ViewStyle,
} from "react-native";

import ViewToken from "./recyclerview/viewability/ViewToken";

export interface ListRenderItemInfo<TItem> {
  item: TItem;
  index: number;
  /**
   * FlashList may render your items for multiple reasons.
   * Cell - This is for your list item
   * Measurement - Might be invoked for size measurement and won't be visible. You can ignore this in analytics.
   * StickyHeader - This is for your sticky header. Use this to change your item's appearance while it's being used as a sticky header.
   */
  target: RenderTarget;
  extraData?: any;
}

export interface OverrideProps {
  initialDrawBatchSize?: number;
  // rest can be string to any
  [key: string]: any;
}

export type RenderTarget = "Cell" | "StickyHeader" | "Measurement";

export const RenderTargetOptions: Record<string, RenderTarget> = {
  Cell: "Cell",
  StickyHeader: "StickyHeader",
  Measurement: "Measurement",
};

export type ListRenderItem<TItem> = (
  info: ListRenderItemInfo<TItem>
) => React.ReactElement | null;

export interface ViewabilityConfigCallbackPair<TItem> {
  viewabilityConfig: ViewabilityConfig;
  onViewableItemsChanged:
    | ((info: {
        viewableItems: ViewToken<TItem>[];
        changed: ViewToken<TItem>[];
      }) => void)
    | null;
}

export type ViewabilityConfigCallbackPairs<TItem> =
  ViewabilityConfigCallbackPair<TItem>[];

export interface FlashListProps<TItem>
  extends Omit<ScrollViewProps, "maintainVisibleContentPosition"> {
  /**
   * Takes an item from `data` and renders it into the list. Typical usage:
   * ```ts
   * renderItem = ({item}) => (
   *   <Text>{item.title}</Text>
   * );
   * ...
   * <FlashList data={[{title: 'Title Text', key: 'item1'}]} renderItem={renderItem} />
   * ```
   *
   * Provides additional metadata like `index`
   *
   * - `item` (`Object`): The item from `data` being rendered.
   * - `index` (`number`): The index corresponding to this item in the `data` array.
   */
  renderItem: ListRenderItem<TItem> | null | undefined;

  /**
   * For simplicity, data is a plain array of items of a given type.
   */
  data: ReadonlyArray<TItem> | null | undefined;

  /**
   * Each cell is rendered using this element.
   * Can be a React Component Class, or a render function.
   * The root component should always be a `CellContainer` which is also the default component used.
   * Ensure that the original `props` are passed to the returned `CellContainer`. The `props` will include the following:
   * - `onLayout`: Method for updating data about the real `CellContainer` layout
   * - `index`: Index of the cell in the list, you can use this to query data if needed
   * - `style`: Style of `CellContainer`, including:
   *   - `flexDirection`: Depends on whether your list is horizontal or vertical
   *   - `position`: Value of this will be `absolute` as that's how `FlashList` positions elements
   *   - `left`: Determines position of the element on x axis
   *   - `top`: Determines position of the element on y axis
   *   - `width`: Determines width of the element (present when list is vertical)
   *   - `height`: Determines height of the element (present when list is horizontal)
   *
   * Note: Changing layout of the cell can conflict with the native layout operations. You may need to set `disableAutoLayout` to `true` to prevent this.
   */
  CellRendererComponent?: React.ComponentType<any> | undefined;

  /**
   * Rendered in between each item, but not at the top or bottom. By default, `leadingItem` and `trailingItem` (if available) props are provided.
   */
  ItemSeparatorComponent?: React.ComponentType<any> | null | undefined;

  /**
   * Rendered when the list is empty. Can be a React Component (e.g. `SomeComponent`), or a React element (e.g. `<SomeComponent />`).
   */
  ListEmptyComponent?:
    | React.ComponentType<any>
    | React.ReactElement
    | null
    | undefined;

  /**
   * Rendered at the bottom of all the items. Can be a React Component (e.g. `SomeComponent`), or a React element (e.g. `<SomeComponent />`).
   */
  ListFooterComponent?:
    | React.ComponentType<any>
    | React.ReactElement
    | null
    | undefined;

  /**
   * Styling for internal View for `ListFooterComponent`.
   */
  ListFooterComponentStyle?: StyleProp<ViewStyle> | undefined;

  /**
   * Rendered at the top of all the items. Can be a React Component (e.g. `SomeComponent`), or a React element (e.g. `<SomeComponent />`).
   */
  ListHeaderComponent?:
    | React.ComponentType<any>
    | React.ReactElement
    | null
    | undefined;

  /**
   * Styling for internal View for `ListHeaderComponent`.
   */
  ListHeaderComponentStyle?: StyleProp<ViewStyle> | undefined;

  /**
   * Rendered as the main scrollview.
   */
  renderScrollComponent?:
    | React.ComponentType<ScrollViewProps>
    | React.FC<ScrollViewProps>;

  /**
   * Draw distance for advanced rendering (in dp/px)
   */
  drawDistance?: number;

  /**
   * A marker property for telling the list to re-render (since it implements PureComponent).
   * If any of your `renderItem`, Header, Footer, etc. functions depend on anything outside of the `data` prop,
   * stick it here and treat it immutably.
   */
  extraData?: any;

  /**
   * If true, renders items next to each other horizontally instead of stacked vertically.
   */
  horizontal?: boolean | null | undefined;

  /**
   * Instead of starting at the top with the first item, start at initialScrollIndex.
   */
  initialScrollIndex?: number | null | undefined;

  /**
   * Used to extract a unique key for a given item at the specified index.
   * Key is used for optimizing performance. Defining `keyExtractor` is also necessary
   * when doing [layout animations](https://shopify.github.io/flash-list/docs/guides/layout-animation)
   * to uniquely identify animated components.
   */
  keyExtractor?: ((item: TItem, index: number) => string) | undefined;

  /**
   * Multiple columns can only be rendered with `horizontal={false}` and will zig-zag like a `flexWrap` layout.
   * Items should all be the same height - masonry layouts are not supported.
   */
  numColumns?: number | undefined;

  /**
   * Called once when the scroll position gets within onEndReachedThreshold of the rendered content.
   */
  onEndReached?: (() => void) | null | undefined;

  /**
   * How far from the end (in units of visible length of the list) the bottom edge of the
   * list must be from the end of the content to trigger the `onEndReached` callback.
   * Thus a value of 0.5 will trigger `onEndReached` when the end of the content is
   * within half the visible length of the list. Default value is 0.5.
   */
  onEndReachedThreshold?: number | null | undefined;

  /**
   * This event is raised once the list has drawn items on the screen. It also reports @param elapsedTimeInMs which is the time it took to draw the items.
   * This is required because FlashList doesn't render items in the first cycle. Items are drawn after it measures itself at the end of first render.
   * If you're using ListEmptyComponent, this event is raised as soon as ListEmptyComponent is rendered.
   */
  onLoad?: (info: { elapsedTimeInMs: number }) => void;

  /**
   * Called when the viewability of rows changes, as defined by the `viewabilityConfig` prop.
   * Array of `changed` includes `ViewToken`s that both visible and non-visible items. You can use the `isViewable` flag to filter the items.
   *
   * If you are tracking the time a view becomes (non-)visible, use the `timestamp` property.
   * We make no guarantees that in the future viewability callbacks will be invoked as soon as they happen - for example,
   * they might be deferred until JS thread is less busy.
   */
  onViewableItemsChanged?:
    | ((info: {
        viewableItems: ViewToken<TItem>[];
        changed: ViewToken<TItem>[];
      }) => void)
    | null
    | undefined;

  /**
   * If provided, a standard RefreshControl will be added for "Pull to Refresh" functionality.
   * Make sure to also set the refreshing prop correctly.
   */
  onRefresh?: (() => void) | null | undefined;

  /**
   * Allows developers to override type of items. This will improve recycling if you have different types of items in the list
   * Right type will be used for the right item. Default type is 0
   * If you don't want to change for an indexes just return undefined.
   * Performance: This method is called very frequently. Keep it fast.
   */
  getItemType?: (
    item: TItem,
    index: number,
    extraData?: any
  ) => string | number | undefined;

  /**
   * This method can be used to change column span of an item.
   * Changing item span is useful when you have grid layouts (numColumns > 1) and you want few items to be bigger than the rest.
   *
   * Modify the given layout. Do not return. FlashList will fallback to default values if this is ignored.
   *
   * Performance: This method is called very frequently. Keep it fast.
   */
  overrideItemLayout?: (
    layout: { span?: number },
    item: TItem,
    index: number,
    maxColumns: number,
    extraData?: any
  ) => void;

  /**
   * For debugging and exception use cases, internal props will be overriden with these values if used
   */
  overrideProps?: OverrideProps;

  /**
   * Set this when offset is needed for the loading indicator to show correctly.
   * @platform android
   */
  progressViewOffset?: number | undefined;

  /**
   * Set this true while waiting for new data from a refresh.
   */
  refreshing?: boolean | null | undefined;

  /**
   * `viewabilityConfig` is a default configuration for determining whether items are viewable.
   *
   * Changing viewabilityConfig on the fly is not supported.
   */
  viewabilityConfig?: ViewabilityConfig | null | undefined;

  /**
   * List of `ViewabilityConfig`/`onViewableItemsChanged` pairs.
   * A specific `onViewableItemsChanged` will be called when its corresponding `ViewabilityConfig`'s conditions are met.
   */
  viewabilityConfigCallbackPairs?:
    | ViewabilityConfigCallbackPairs<TItem>
    | undefined;

  /**
   * New arch only
   * Maximum number of items in the recycle pool. These are the items that are cached in the recycle pool when they are scrolled off the screen.
   * Unless you have a huge number of item types, you shouldn't need to set this.
   * Setting this to 0, will disable the recycle pool and items will unmount once they are scrolled off the screen.
   * There's no limit by default.
   */
  maxItemsInRecyclePool?: number;

  /**
   * New arch only
   * Enable masonry layout.
   */
  masonry?: boolean;
  /**
   * New arch only
   * If enabled, MasonryFlashList will try to reduce difference in column height by modifying item order.
   */
  optimizeItemArrangement?: boolean; // TODO: Check if this breaks on item resize or is glitchy

  /**
   * New arch only
   * Called once when the scroll position gets within onStartReachedThreshold of the start of the content.
   */
  onStartReached?: FlashListProps<TItem>["onEndReached"];

  /**
   * New arch only
   * How far from the start (in units of visible length of the list) the top edge of the
   * list must be from the start of the content to trigger the `onStartReached` callback.
   * Thus a value of 0.5 will trigger `onStartReached` when the start of the content is
   * within half the visible length of the list. Default value is 0.2.
   */
  onStartReachedThreshold?: FlashListProps<TItem>["onEndReachedThreshold"];

  /**
   * New arch only
   * Style for the RecyclerView's parent container.
   * Please avoid anything which can mess size of children in this view. For example, margin is okay but padding is not.
   */
  style?: ViewStyle;

  /**
   * New arch only
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
     * Scroll with animation whenever `autoscrollToBottom` is triggered. Default is `true`.
     * Default is true.
     */
    animateAutoScrollToBottom?: boolean;
    /**
     * If true, initial render will start from the bottom of the list, useful for chat-like interfaces when there are only few messages
     */
    startRenderingFromBottom?: boolean;
  };

  /**
   * New arch only
   * Called when the layout is committed. Can be used to measure list.
   * Doing set state inside the callback can lead to infinite loops. Make sure FlashList's props are memoized.
   */
  onCommitLayoutEffect?: () => void;
}
