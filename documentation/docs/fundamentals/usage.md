---
id: usage
title: Usage
slug: /usage
sidebar_position: 0
---

If you are familiar with [FlatList](https://reactnative.dev/docs/flatlist), you already know how to use `FlashList`. You can try out `FlashList` by changing the component name.

```tsx
import React from "react";
import { View, Text, StatusBar } from "react-native";
import { FlashList } from "@shopify/flash-list";

const DATA = [
  {
    title: "First Item",
  },
  {
    title: "Second Item",
  },
];

const MyList = () => {
  return (
    <FlashList
      data={DATA}
      renderItem={({ item }) => <Text>{item.title}</Text>}
    />
  );
};
```

## Important things to know {#migration-steps}

To avoid common pitfalls, you can also follow these steps for migrating from `FlatList`, based on our own experience.

1. Simply change from `FlatList` to `FlashList` and render the list.
2. **Important**: Scan your [`renderItem`](https://shopify.github.io/flash-list/docs/usage/#renderitem) hierarchy for explicit `key` prop definitions and remove them. If you’re doing a `.map()` use our hook called [`useMappingHelper`](https://shopify.github.io/flash-list/docs/usage/#usemappinghelper).
3. Check your [`renderItem`](https://shopify.github.io/flash-list/docs/usage/#renderitem) hierarchy for components that make use of `useState` and verify whether that state would need to be reset if a different item is passed to that component (see [Recycling](https://shopify.github.io/flash-list/docs/recycling))
4. If your list has heterogenous views, pass their types to `FlashList` using [`getItemType`](https://shopify.github.io/flash-list/docs/usage/#getitemtype) prop to improve performance.
5. Do not test performance with JS dev mode on. Make sure you’re in release mode. `FlashList` can appear slower while in dev mode due to a small render buffer.
6. Memoizing props passed to FlashList is more important in v2. v1 was more selective about updating items, but this was often perceived as a bug by developers. We will not follow that approach and will instead allow developers to ensure that props are memoized. We will stop re-renders of children wherever it is obvious.
7. `keyExtractor` is important to prevent glitches due to item layout changes when going upwards. We highly recommend having a valid `keyExtractor` with v2.
8. Read about new hooks that simplify recycling and reacting to layout changes: [`useLayoutState`](https://shopify.github.io/flash-list/docs/usage/#usemappinghelper), [`useRecyclingState`](https://shopify.github.io/flash-list/docs/usage/#usemappinghelper)
9. If you're nesting horizontal FlashLists in vertical lists, we highly recommend the vertical list to be FlashList too. We have optimizations to wait for child layout to complete which can improve load times.

# Props

### **`renderItem`**

:::note
Required
:::

```tsx
renderItem: ({ item, index, target, extraData }) => void;
```

Takes an item from `data` and renders it into the list. Typical usage:

```tsx
renderItem = ({item}) => (
  <Text>{item.title}</Text>
);
...
<FlashList data={[{title: 'Title Text', key: 'item1'}]} renderItem={renderItem} />
```

Provides additional metadata like `index`

- `item` (`Object`): The item from `data` being rendered.
- `index` (`number`): The index corresponding to this item in the `data` array.
- `target` (`string`): FlashList may render your items for multiple reasons.
  - `Cell` - This is for your list item.
  - `Measurement` - Might be invoked for size measurement and won't be visible. You can ignore this in analytics.
  - `StickyHeader` - This is for your sticky header. Use this to change your item's appearance while it's being used as a sticky header.
- `extraData` (`Object`) - This is the same `extraData` prop that was passed to `FlashList`.

### **`data`**

:::note
Required
:::

For simplicity, data is a plain array of items of a given type.

```tsx
data: ItemT[];
```

### `CellRendererComponent`

Each cell is rendered using this element. Can be a React Component Class, or a render function. The root component should always be a `CellContainer` which is also the default component used. Ensure that the original `props` are passed to the returned `CellContainer`. The `props` contain the following properties:

- `onLayout`: Method for updating data about the real `CellContainer` layout
- `index`: Index of the cell in the list, you can use this to query data if needed
- `style`: Style of `CellContainer`, including:
  - `flexDirection`: Depends on whether your list is horizontal or vertical
  - `position`: Value of this will be `absolute` as that's how `FlashList` positions elements
  - `left`: Determines position of the element on x axis
  - `top`: Determines position of the element on y axis
  - `width`: Determines width of the element (present when list is vertical)
  - `height`: Determines height of the element (present when list is horizontal)

When using with `react-native-reanimated`, you can wrap `CellContainer` in `Animated.createAnimatedComponent` (this is similar to using `Animated.View`):

```ts
const AnimatedCellContainer = Animated.createAnimatedComponent(CellContainer);
return (
  <FlashList
    CellRendererComponent={(props) => {
      return (
          <AnimatedCellContainer {...props} style={...}>
      );
    }}
  />
);
```

```ts
CellRendererComponent?: React.ComponentType<any> | undefined;
```

### `ItemSeparatorComponent`

Rendered in between each item, but not at the top or bottom. By default, `leadingItem` and `trailingItem` (if available) props are provided.

```tsx
ItemSeparatorComponent?: React.ComponentType<any>;
```

### `ListEmptyComponent`

Rendered when the list is empty. Can be a React Component (e.g. `SomeComponent`), or a React element (e.g. `<SomeComponent />`).

```tsx
ListEmptyComponent?: React.ComponentType<any> | React.ReactElement<any, string | React.JSXElementConstructor<any>>;
```

### `ListFooterComponent`

Rendered at the bottom of all the items. Can be a React Component (e.g. `SomeComponent`), or a React element (e.g. `<SomeComponent />`).

```tsx
ListFooterComponent?: React.ComponentType<any> | React.ReactElement<any, string | React.JSXElementConstructor<any>>;
```

### `ListFooterComponentStyle`

Styling for internal View for `ListFooterComponent`.

```tsx
ListFooterComponentStyle?: StyleProp<ViewStyle>;
```

### `ListHeaderComponent`

Rendered at the top of all the items. Can be a React Component (e.g. `SomeComponent`), or a React element (e.g. `<SomeComponent />`).

```tsx
ListHeaderComponent?: React.ComponentType<any> | React.ReactElement<any, string | React.JSXElementConstructor<any>>;
```

### `ListHeaderComponentStyle`

Styling for internal View for `ListHeaderComponent`.

```tsx
ListHeaderComponentStyle?: StyleProp<ViewStyle>;
```

### `contentContainerStyle`

```tsx
contentContainerStyle?: ContentStyle;

export type ContentStyle = Pick<
  ViewStyle,
  | "backgroundColor"
  | "paddingTop"
  | "paddingLeft"
  | "paddingRight"
  | "paddingBottom"
  | "padding"
  | "paddingVertical"
  | "paddingHorizontal"
>;
```

You can use `contentContainerStyle` to apply padding that will be applied to the whole content itself. For example, you can apply this padding, so that all of your items have leading and trailing space.

### `drawDistance`

```tsx
drawDistance?: number;
```

Draw distance for advanced rendering (in `dp`/`px`).

### `extraData`

A marker property for telling the list to re-render (since it implements `PureComponent`). If any of your `renderItem`, Header, Footer, etc. functions depend on anything outside of the `data` prop, stick it here and treat it immutably.

```tsx
extraData?: any;
```

### `horizontal`

If `true`, renders items next to each other horizontally instead of stacked vertically. Default is `false`.

```tsx
horizontal?: boolean;
```

### `initialScrollIndex`

Instead of starting at the top with the first item, start at `initialScrollIndex`.

```tsx
initialScrollIndex?: number;
```

### `initialScrollIndexParams`

Additional configuration for initialScrollIndex. Use viewOffset to apply an offset to the initial scroll position as defined by initialScrollIndex.
Ignored if initialScrollIndex is not set.

```tsx
initialScrollIndexParams?: { viewOffset?: number };
```

### `keyExtractor`

```tsx
keyExtractor?: (item: object, index: number) => string;
```

Used to extract a unique key for a given item at the specified index. Key is used for optimizing performance. Defining `keyExtractor` is also necessary when doing [layout animations](/guides/layout-animation) to uniquely identify animated components.

### `maintainVisibleContentPosition`

```tsx
maintainVisibleContentPosition?: {
  disabled?: boolean;
  autoscrollToTopThreshold?: number;
  autoscrollToBottomThreshold?: number;
  startRenderingFromBottom?: boolean;
};
```

Configuration for maintaining scroll position when content changes. This is enabled by default to reduce visible glitches.

- `disabled`: Set to true to disable this feature. It's enabled by default.
- `autoscrollToTopThreshold`: Automatically scroll to maintain position when content is added at the top.
- `autoscrollToBottomThreshold`: Automatically scroll to maintain position when content is added at the bottom.
- `animateAutoScrollToBottom`: Scroll with animation whenever `autoScrollToBottom` is triggered. Default is `true`.
- `startRenderingFromBottom`: If true, initial render will start from the bottom, useful for chat interfaces.

Example:

```jsx
<FlashList
  data={chatMessages}
  maintainVisibleContentPosition={{
    autoscrollToBottomThreshold: 0.2,
    startRenderingFromBottom: true,
  }}
  renderItem={({ item }) => <ChatMessage message={item} />}
/>
```

### `masonry`

```tsx
masonry?: boolean;
```

Enable masonry layout for grid-like interfaces with varying item heights. When used with `numColumns > 1`, this creates a masonry-style layout.

```jsx
<FlashList
  data={data}
  masonry
  numColumns={3}
  renderItem={({ item }) => <MasonryItem item={item} />}
/>
```

### `maxItemsInRecyclePool`

Maximum number of items in the recycle pool. These are the items that are cached in the recycle pool when they are scrolled off the screen. Unless you have a huge number of item types, you shouldn't need to set this.

Setting this to 0, will disable the recycle pool and items will unmount once they are scrolled off the screen.
There's no limit by default.

### `numColumns`

Multiple columns can only be rendered with `horizontal={false}` and will zig-zag like a `flexWrap` layout. Items should all be the same height - masonry layouts are not supported.

`numColumns?: number;`

### `stickyHeaderConfig`

Configuration object for sticky header behavior and appearance. All properties are optional.

```tsx
stickyHeaderConfig?: {
  useNativeDriver?: boolean;
  offset?: number;
  backdropComponent?: React.ComponentType<any> | React.ReactElement | null;
  hideRelatedCell?: boolean;
};
```

#### `useNativeDriver`

If true, the sticky headers will use native driver for animations. Default is `true`.

```tsx
useNativeDriver?: boolean;
```

#### `offset`

Offset from the top of the list where sticky headers should stick.
This is useful when you have a fixed header or navigation bar at the top of your screen
and want sticky headers to appear below it instead of at the very top.
Default is `0`.

```tsx
offset?: number;
```

#### `backdropComponent`

Component to render behind sticky headers (e.g., a backdrop or blur effect).
Renders in front of the scroll view content but behind the sticky header itself.
Useful for creating visual separation or effects like backgrounds with blur.

```tsx
backdropComponent?: React.ComponentType<any> | React.ReactElement | null;
```

#### `hideRelatedCell`

When a sticky header is displayed, the cell associated with it is hidden.
Default is `false`.

```tsx
hideRelatedCell?: boolean;
```

**Example:**

```jsx
<FlashList
  data={sectionData}
  stickyHeaderIndices={[0, 10, 20]}
  stickyHeaderConfig={{
    useNativeDriver: true,
    offset: 50, // Headers stick 50px from top
    backdropComponent: <BlurView style={StyleSheet.absoluteFill} />,
    hideRelatedCell: true,
  }}
  renderItem={({ item }) => <ListItem item={item} />}
/>
```

### `onChangeStickyIndex`

Callback invoked when the currently displayed sticky header changes as you scroll.
Receives the current sticky header index and the previous sticky header index.
This is useful for tracking which header is currently stuck at the top while scrolling.
The index refers to the position of the item in your data array that's being used as a sticky header.

```tsx
onChangeStickyIndex?: (current: number, previous: number) => void;
```

Example:

```jsx
<FlashList
  data={sectionData}
  stickyHeaderIndices={[0, 10, 20]}
  onChangeStickyIndex={(current, previous) => {
    console.log(`Sticky header changed from ${previous} to ${current}`);
  }}
  renderItem={({ item }) => <ListItem item={item} />}
/>
```

### `onBlankArea`

```tsx
onBlankArea?: (blankAreaEvent: {
    offsetStart: number;
    offsetEnd: number;
    blankArea: number;
}) => void;
```

`FlashList` computes blank space that is visible to the user during scrolling or the initial loading of the list.

Values reported:

- `offsetStart`: visible blank space on top of the screen (while going up). If value is greater than 0, it's visible to user.
- `offsetEnd`: visible blank space at the end of the screen (while going down). If value is greater than 0, it's visible to user.
- `blankArea`: maximum of `offsetStart` and `offsetEnd`. You might see negative values indicating that items are rendered outside the list's visible area.

:::warning
This callback will be triggered even if the blanks are excepted - for example, when the list does not have enough items to fill the screen.
:::

:::note
This event isn't synced with `onScroll` event from the JS layer but works with native methods `onDraw` (Android) and `layoutSubviews` (iOS).
:::

### `onCommitLayoutEffect`

```tsx
onCommitLayoutEffect?: () => void;
```

Called before layout is committed. Can be used to measure list and make changes before paint. Doing setState inside the callback can lead to infinite loops. Make sure FlashList's props are memoized.

### `onEndReached`

```tsx
onEndReached?: () => void;
```

Called once when the scroll position gets within `onEndReachedThreshold` of the rendered content.

### `onEndReachedThreshold`

```tsx
onEndReachedThreshold?: number;
```

How far from the end (in units of visible length of the list) the bottom edge of the list must be from the end of the content to trigger the `onEndReached` callback. Thus a value of 0.5 will trigger `onEndReached` when the end of the content is within half the visible length of the list.

### `onLoad`

```tsx
onLoad: (info: { elapsedTimeInMs: number }) => void;
```

This event is raised once the list has drawn items on the screen. It also reports elapsedTimeInMs which is the time it took to draw the items. This is required because FlashList doesn't render items in the first cycle. Items are drawn after it measures itself at the end of first render. Please note that the event is not fired if ListEmptyComponent is rendered.

### `onRefresh`

```tsx
onRefresh?: () => void;
```

If provided, a standard RefreshControl will be added for "Pull to Refresh" functionality. Make sure to also set the `refreshing` prop correctly.

### `getItemType`

```tsx
getItemType?: (
    item: T,
    index: number,
    extraData?: any
) => string | number | undefined;
```

Allows developers to specify item types. This will improve recycling if you have different types of items in the list. Right type will be used for the right item.Default type is 0. If you don't want to change for an indexes just return undefined. You can see example of how to use this prop [here](performant-components.md#getitemtype).

:::warning Performance
This method is called very frequently. Keep it fast.
:::

### `onStartReached`

```tsx
onStartReached?: () => void;
```

Called once when the scroll position gets within `onStartReachedThreshold` of the start of the content. Useful for loading older content in infinite scroll scenarios like chat applications.

```jsx
<FlashList
  data={messageData}
  onStartReached={() => loadOlderMessages()}
  onStartReachedThreshold={0.1}
  renderItem={({ item }) => <MessageItem message={item} />}
/>
```

### `onStartReachedThreshold`

```tsx
onStartReachedThreshold?: number;
```

How far from the start (in units of visible length of the list) the top edge of the list must be from the start of the content to trigger the `onStartReached` callback. Value of 0.5 will trigger `onStartReached` when the start of the content is within half the visible length of the list from the top.

### `onViewableItemsChanged`

```tsx
interface ViewToken {
  index: number;
  isViewable: boolean;
  item: string;
  key: string;
  timestamp: number;
}

onViewableItemsChanged?: ((info: {
    viewableItems: ViewToken[];
    changed: ViewToken[];
}) => void) | null | undefined
```

Called when the viewability of rows changes, as defined by the `viewabilityConfig` prop. Array of `changed` includes `ViewToken`s that both visible and non-visible items. You can use the `isViewable` flag to filter the items.

:::note
If you are tracking the time a view becomes (non-)visible, use the `timestamp` property. We make no guarantees that in the future viewability callbacks will be invoked as soon as they happen - for example, they might be deferred until JS thread is less busy.
:::

### `optimizeItemArrangement`

```tsx
optimizeItemArrangement?: boolean;
```

When enabled with `masonry` layout, this will try to reduce differences in column height by modifying item order. Default is `true`.

### `overrideItemLayout`

```tsx
overrideItemLayout?: (
    layout: { span?: number;},
    item: T,
    index: number,
    maxColumns: number,
    extraData?: any
) => void;
```

This method can be used to change column span of an item.

In v2, span is supported, but size estimates are no longer needed or read.

Changing item span is useful when you have grid layouts (numColumns > 1) and you want few items to be bigger than the rest.

```jsx
<FlashList
  data={gridData}
  numColumns={2}
  overrideItemLayout={(layout, item) => {
    layout.span = item.span; // Set span
  }}
  renderItem={({ item }) => <GridItem item={item} />}
/>
```

:::warning Performance
This method is called very frequently. Keep it fast.
:::

### `overrideProps`

```tsx
overrideProps?: object;
```

We do not recommend using this prop for anything else than debugging. Internal props of the list will be overriden with the provided values.

### `progressViewOffset`

```tsx
progressViewOffset?: number;
```

Set this when offset is needed for the loading indicator to show correctly.

### `refreshControl`

```tsx
refreshControl?: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
```

A custom refresh control element. When set, it overrides the default `<RefreshControl>` component built internally. The onRefresh and refreshing props are also ignored. Only works for vertical VirtualizedList.

### `refreshing`

```tsx
refreshing?: boolean;
```

Set this true while waiting for new data from a refresh.

### `renderScrollComponent`

```tsx
import type { ScrollViewProps } from "react-native";

renderScrollComponent?:
    | React.ComponentType<ScrollViewProps>
    | React.FC<ScrollViewProps>;
```

Rendered as the main scrollview.

### `style`

```tsx
style?: StyleProp<ViewStyle>;
```

Style for the FlashList's parent container. It's highly recommended to avoid adding padding which can impact the size of the ScrollView inside. We operate on the assumption that the size of parent view and ScrollView is the same. In most cases, `contentContainerStyle` should be enough, so avoid using this.

### `viewabilityConfig`

```tsx
interface ViewabilityConfig: {
  minimumViewTime: number;
  viewAreaCoveragePercentThreshold: number;
  itemVisiblePercentThreshold: number;
  waitForInteraction: boolean;
}

viewabilityConfig?: ViewabilityConfig;
```

`viewabilityConfig` is a default configuration for determining whether items are viewable.

:::warning
Changing viewabilityConfig on the fly is not supported
:::

Example:

```tsx
<FlashList
    viewabilityConfig={{
      waitForInteraction: true,
      itemVisiblePercentThreshold: 50,
      minimumViewTime: 1000,
    }}
  ...
```

#### minimumViewTime

Minimum amount of time (in milliseconds) that an item must be physically viewable before the viewability callback will be fired. A high number means that scrolling through content without stopping will not mark the content as viewable. The default value is 250. We do not recommend setting much lower values to preserve performance when quickly scrolling.

#### viewAreaCoveragePercentThreshold

Percent of viewport that must be covered for a partially occluded item to count as "viewable", 0-100. Fully visible items are always considered viewable. A value of 0 means that a single pixel in the viewport makes the item viewable, and a value of 100 means that an item must be either entirely visible or cover the entire viewport to count as viewable.

#### itemVisiblePercentThreshold

Similar to `viewAreaCoveragePercentThreshold`, but considers the percent of the item that is visible, rather than the fraction of the viewable area it covers.

#### waitForInteraction

Nothing is considered viewable until the user scrolls or `recordInteraction` is called after render.

### `viewabilityConfigCallbackPairs`

```tsx
type ViewabilityConfigCallbackPairs = ViewabilityConfigCallbackPair[];

interface ViewabilityConfigCallbackPair {
  viewabilityConfig: ViewabilityConfig;
  onViewableItemsChanged:
    | ((info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => void)
    | null;
}

viewabilityConfigCallbackPairs: ViewabilityConfigCallbackPairs | undefined;
```

List of `ViewabilityConfig`/`onViewableItemsChanged` pairs. A specific `onViewableItemsChanged` will be called when its corresponding `ViewabilityConfig`'s conditions are met.

# Hooks

### useLayoutState

```tsx
const [state, setState] = useLayoutState(initialState);
```

This is similar to `useState` but communicates the change in state to FlashList. It's useful if you want to resize a child component based on a local state. Item layout changes will still be detected using `onLayout` callback in the absence of `useLayoutState`, which might not look as smooth on a case-by-case basis.

```jsx
import { useLayoutState } from "@shopify/flash-list";

const MyItem = ({ item }) => {
  const [isExpanded, setIsExpanded] = useLayoutState(false);
  const height = isExpanded ? 150 : 80;

  return (
    <Pressable onPress={() => setIsExpanded(!isExpanded)}>
      <View style={{ height, padding: 16 }}>
        <Text>{item.title}</Text>
      </View>
    </Pressable>
  );
};
```

### useRecyclingState

```tsx
const [state, setState] = useRecyclingState(
  initialState,
  dependencies,
  resetCallback
);
```

Similar to `useState` but accepts a dependency array. On change of deps, the state gets reset without an additional `setState` call. Useful for maintaining local item state if really necessary. It also has the functionality of `useLayoutState` built in.

```jsx
import { useRecyclingState } from "@shopify/flash-list";

const GridItem = ({ item }) => {
  const [isExpanded, setIsExpanded] = useRecyclingState(
    false,
    [item.id],
    () => {
      // runs on reset. Can be used to reset scroll positions of nested horizontal lists
    }
  );
  const height = isExpanded ? 100 : 50;

  return (
    <Pressable onPress={() => setIsExpanded(!isExpanded)}>
      <View style={{ height, backgroundColor: item.color }}>
        <Text>{item.title}</Text>
      </View>
    </Pressable>
  );
};
```

### useMappingHelper

```tsx
const { getMappingKey } = useMappingHelper();
```

Returns a function that helps create a mapping key for items when using `.map()` in your render methods. Using this ensures that performance is optimal for FlashList by providing consistent keys that work with the recycling system.

The `getMappingKey` function takes two parameters:

- `index`: The index of the item in the array
- `itemKey`: A unique identifier for the item (string, number, or bigint)

It returns the appropriate key value to use in the `key` prop based on the current context.

**Basic usage:**

```jsx
import { useMappingHelper } from "@shopify/flash-list";

const MyComponent = ({ items }) => {
  const { getMappingKey } = useMappingHelper();

  return (
    <View>
      {items.map((item, index) => (
        <Text key={getMappingKey(item.id, index)}>{item.title}</Text>
      ))}
    </View>
  );
};
```

**When to use it:**

- When mapping over arrays to create lists of components inside FlashList items
- When building nested components that render multiple items from an array
- To ensure consistent key generation that works well with FlashList's recycling system

### useFlashListContext

Exposes helpers to easily access `ref` of FlashList. It also exposes `ref` of ScrollView. Ideal for use within child components or `CellRendererComponent`.

# FlashList methods

### `prepareForLayoutAnimationRender()`

```tsx
prepareForLayoutAnimationRender(): void;
```

Run this method before running layout animations, such as when animating an element when deleting it. This method disables recycling for the next frame so that layout animations run well.

:::warning
Avoid using this when making large changes to the data as the list might draw too much to run animations since the method disables recycling temporarily. Single item insertions or deletions should animate smoothly. The render after animation will enable recycling again and you can stop avoiding making large data changes.
:::

### `recordInteraction()`

```tsx
recordInteraction();
```

Tells the list an interaction has occurred, which should trigger viewability calculations, e.g. if `waitForInteractions` is true and the user has not scrolled. You should typically call `recordInteraction()` when user for example taps on an item or invokes a navigation action.

### `recomputeViewableItems()`

```tsx
recomputeViewableItems();
```

Retriggers viewability calculations. Useful to imperatively trigger viewability calculations.

### `scrollToEnd()`

```tsx
scrollToEnd?: (params?: { animated?: boolean | null | undefined });
```

Scrolls to the end of the content.

### `scrollToIndex()`

```tsx
scrollToIndex(params: {
  animated?: boolean | null | undefined;
  index: number;
  viewOffset?: number | undefined;
  viewPosition?: number | undefined;
});
```

Scroll to a given index.

### `scrollToItem()`

```tsx
scrollToItem(params: {
  animated?: boolean | null | undefined;
  item: any;
  viewPosition?: number | undefined;
});
```

Scroll to a given item.

### `scrollToOffset()`

```tsx
scrollToOffset(params: {
  animated?: boolean | null | undefined;
  offset: number;
});
```

Scroll to a specific content pixel offset in the list.

Param `offset` expects the offset to scroll to. In case of `horizontal` is true, the offset is the x-value, in any other case the offset is the y-value.

Param `animated` (`false` by default) defines whether the list should do an animation while scrolling.

### `computeVisibleIndices()`

Returns an array of indices that are currently visible in the list.

```tsx
computeVisibleIndices(): number[];
```

### `getLayout()`

Returns the current layout information for the list.

```tsx
getLayout(): { x: number, y: number, width: number; height: number };
```

### `flashScrollIndicators()`

Shows the scroll indicators momentarily.

```tsx
flashScrollIndicators(): void;
```

### `getNativeScrollRef()`

Returns a reference to the underlying scroll view.

```tsx
getNativeScrollRef(): React.RefObject<CompatScroller>;
```

### `getScrollResponder()`

Returns the scroll responder of the underlying scroll view.

```tsx
getScrollResponder(): any;
```

### `getScrollableNode()`

Returns the native scrollable node of the underlying scroll view.

```tsx
getScrollableNode(): any;
```

### `scrollToTop()`

Scrolls to the top of the list.

```tsx
scrollToTop(params?: { animated?: boolean }): void;
```

### `getFirstItemOffset()`

Returns the offset of the first item (useful for calculating header size or top padding).

```tsx
getFirstItemOffset(): number;
```

### `getWindowSize()`

Returns the current rendered dimensions of the list.

```tsx
getWindowSize(): { width: number, height: number };
```

### `getFirstVisibleIndex()`

Returns the index of the first visible item in the list.

```tsx
getFirstVisibleIndex(): number;
```

# ScrollView props

`FlashList`, as `FlatList`, uses `ScrollView` under the hood. You can take a look into the React Native documentation for [`ScrollView`](https://reactnative.dev/docs/scrollview) to see the exhaustive list of props.

# Unsupported `FlatList` props

The following props from `FlatList` are currently not implemented:

- [`columnWrapperStyle`](https://reactnative.dev/docs/flatlist#columnwrapperstyle)
- [`debug`](https://reactnative.dev/docs/virtualizedlist#debug)
- [`listKey`](https://reactnative.dev/docs/virtualizedlist#listkey)

There are also `FlatList` props that would bring no value if ported to `FlashList` due to the differences in their underlying implementation:

- [`disableVirtualization`](https://reactnative.dev/docs/virtualizedlist#disablevirtualization)
- [`getItemLayout`](https://reactnative.dev/docs/flatlist#getItemLayout)
- [`initialNumToRender`](https://reactnative.dev/docs/flatlist#initialnumtorender)
- [`maxToRenderPerBatch`](https://reactnative.dev/docs/virtualizedlist#maxtorenderperbatch)
- [`recordInteraction`](https://reactnative.dev/docs/virtualizedlist#recordinteraction)
- [`setNativeProps`](https://reactnative.dev/docs/virtualizedlist#setnativeprops)
- [`updateCellsBatchingPeriod`](https://reactnative.dev/docs/virtualizedlist#updatecellsbatchingperiod)
- [`onScrollToIndexFailed`](https://reactnative.dev/docs/virtualizedlist#onscrolltoindexfailed)
- [`windowSize`](https://reactnative.dev/docs/virtualizedlist#windowsize)

We don't currently plan to implement these props.
