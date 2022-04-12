---
id: usage
title: Usage
slug: /usage
sidebar_position: 0
---

If you are familiar with [FlatList](https://reactnative.dev/docs/flatlist), you already know how to use `FlashList`. You can try out `FlashList` just by changing the component name and adding `estimatedItemSize` or refer to the example below:

```ts
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
      estimatedItemSize={200}
    />
  );
};
```

:::note `estimatedItemSize`
[`estimatedItemSize`](#estimateditemsize) is necessary to achieve optimal performance.
:::

Most of the props from `FlatList` are available in `FlashList`, too. This documentation includes both `FlatList` and additional `FlashList` props and should be used as a primary reference. But you can also read more about the props available in both `FlatList` and `FlashList` [here](https://reactnative.dev/docs/flatlist).

# Props

`FlashList` also has a couple of unique props. You already know about `estimatedItemSize` but there are more props available for minor adjustments.

### **`renderItem`**

:::note
Required
:::

```ts
renderItem: ({ item, index }) => void;
```

Takes an item from `data` and renders it into the list.

Provides additional metadata like `index`

- `item` (`Object`): The item from `data` being rendered.
- `index` (`number`): The index corresponding to this item in the `data` array.

:::note
`FlatList` also passes `separators` prop in the `renderItem` method which we currently don't support.
:::

### **`data`**

:::note
Required
:::

For simplicity, data is a plain array of items of a given type.

```ts
data: ItemT[];
```

### **`estimatedItemSize`**

:::note
Required
:::

```ts
estimatedItemSize: number;
```

`estimatedItemSize` is a single numeric value that hints `FlashList` about the approximate size of the items before they're rendered. `FlashList` can then use this information to decide how many items it needs to draw on the screen before initial load and while scrolling. If most of the items are of **different sizes**, you can think of an average or median value and if most items are of **the same size**, just use that number. A quick look at `Element Inspector` can help you determine this. If you're confused between two values, the smaller value is a better choice.

---

### `ItemSeparatorComponent`

Rendered in between each item, but not at the top or bottom. By default, `leadingItem` and `trailingItem` (if available) props are provided.

```ts
ItemSeparatorComponent?: React.ComponentType<any>;
```

### `ListEmptyComponent`

Rendered when the list is empty. Can be a React Component (e.g. `SomeComponent`), or a React element (e.g. `<SomeComponent />`).

```ts
ListEmptyComponent?: React.ComponentType<any> | React.ReactElement<any, string | React.JSXElementConstructor<any>>;
```

### `ListFooterComponent`

Rendered at the bottom of all the items. Can be a React Component (e.g. `SomeComponent`), or a React element (e.g. `<SomeComponent />`).

```ts
ListFooterComponent?: React.ComponentType<any> | React.ReactElement<any, string | React.JSXElementConstructor<any>>;
```

### `ListFooterComponentStyle`

Styling for internal View for `ListFooterComponent`.

```ts
ListFooterComponentStyle?: StyleProp<ViewStyle>;
```

### `ListHeaderComponent`

Rendered at the top of all the items. Can be a React Component (e.g. `SomeComponent`), or a React element (e.g. `<SomeComponent />`).

```ts
ListHeaderComponent?: React.ComponentType<any> | React.ReactElement<any, string | React.JSXElementConstructor<any>>;
```

### `ListHeaderComponentStyle`

Styling for internal View for `ListHeaderComponent`.

```ts
ListHeaderComponentStyle?: StyleProp<ViewStyle>;
```

### `contentContainerStyle`

```ts
contentContainerStyle?: ContentStyle;

interface ContentStyle {
  backgroundColor?: ColorValue;
  paddingTop?: string | number;
  paddingLeft?: string | number;
  paddingRight?: string | number;
  paddingBottom?: string | number;
  padding?: string | number;
  paddingVertical?: string | number;
  paddingHorizontal?: string | number;
}
```

You can use `contentContainerStyle` to apply padding that will be applied to the whole content itself. For example, you can apply this padding, so that all of your items have leading and trailing space.

:::note
Horizontal padding is ignored on vertical lists and vertical padding on horizontal ones.
:::

### `drawDistance`

```ts
drawDistance?: number;
```

Draw distance for advanced rendering (in `dp`/`px`).

### `estimatedFirstItemOffset`

```ts
estimatedFirstItemOffset?: number;
```

`estimatedFirstItemOffset` specifies how far the first item is drawn from start of the list window or offset of the first item of the list (not the header). This prop is necessary if you're using [initialScrollIndex](#initialscrollindex) prop. Before the initial draw, the list does not know the size of a header or any special margin/padding that might have been applied using header styles etc. If this isn't provided initialScrollIndex might not scroll to the provided index.

### `estimatedListSize`

```ts
estimatedListSize?: { height: number; width: number }
```

Estimated visible height and width of the list. It is not the scroll content size. Defining this prop will enable the list to be rendered immediately. Without it, the list first needs to measure its size, leading to a small delay during the first render.

### `extraData`

A marker property for telling the list to re-render (since it implements `PureComponent`). If any of your `renderItem`, Header, Footer, etc. functions depend on anything outside of the `data` prop, stick it here and treat it immutably.

```ts
extraData?: any;
```

### `horizontal`

If `true`, renders items next to each other horizontally instead of stacked vertically. Default is `false`.

```ts
horizontal?: boolean;
```

### `initialScrollIndex`

Instead of starting at the top with the first item, start at `initialScrollIndex`. This disables the "scroll to top" optimization that keeps the first `initialNumToRender` items always rendered and immediately renders the items starting at this initial index. Requires `getItemLayout` to be implemented.

```ts
initialScrollIndex?: number;
```

### `inverted`

Reverses the direction of scroll. Uses scale transforms of `-1`.

```ts
inverted?: boolean;
```

### `keyExtractor`

```ts
keyExtractor?: (item: object, index: number) => string;
```

Used to extract a unique key for a given item at the specified index. Key is used for optimizing performance. Defining `keyExtractor` is also necessary when doing [layout animations](/guides/layout-animation) to uniquely identify animated components.

### `numColumns`

Multiple columns can only be rendered with `horizontal={false}` and will zig-zag like a `flexWrap` layout. Items should all be the same height - masonry layouts are not supported.

`numColumns?: number;`

### `onEndReached`

```ts
onEndReached?: (info: {distanceFromEnd: number}) => void;
```

Called once when the scroll position gets within `onEndReachedThreshold` of the rendered content.

### `onEndReachedThreshold`

```ts
onEndReachedThreshold?: number;
```

How far from the end (in units of visible length of the list) the bottom edge of the list must be from the end of the content to trigger the `onEndReached` callback. Thus a value of 0.5 will trigger `onEndReached` when the end of the content is within half the visible length of the list.

### `onBlankArea`

```ts
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

### `onLoad`

```ts
onLoad: (info: { elapsedTimeInMs: number }) => void;
```

This event is raised once the list has drawn items on the screen. It also reports elapsedTimeInMs which is the time it took to draw the items. This is required because FlashList doesn't render items in the first cycle. Items are drawn after it measures itself at the end of first render. If you're using ListEmptyComponent, this event is raised as soon as ListEmptyComponent is rendered.

### `onRefresh`

```ts
onRefresh?: () => void;
```

If provided, a standard RefreshControl will be added for "Pull to Refresh" functionality. Make sure to also set the `refreshing` prop correctly.

### `progressViewOffset`

```ts
progressViewOffset?: number;
```

Set this when offset is needed for the loading indicator to show correctly.

### `refreshing`

```ts
refreshing?: boolean;
```

Set this true while waiting for new data from a refresh.

### `onViewableItemsChanged`

```ts
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

### `overrideItemType`

```ts
overrideItemType?: (
    item: T,
    index: number,
    extraData?: any
) => string | number | undefined;
```

Allows developers to override type of items. This will improve recycling if you have different types of items in the list. Right type will be used for the right item.Default type is 0. If you don't want to change for an indexes just return undefined.

:::warning Performance
This method is called very frequently. Keep it fast.
:::

### `overrideItemLayout`

```ts
overrideItemLayout?: (
    layout: { span?: number; size?: number },
    item: T,
    index: number,
    maxColumns: number,
    extraData?: any
) => void;
```

This method can be used to provide explicit size estimates or change column span of an item.

Providing specific estimates is a good idea when you can calculate sizes reliably. FlashList will prefer this value over `estimatedItemSize` for that specific item.
Precise estimates will also improve precision of `scrollToIndex` method and `initialScrollIndex` prop. If you have a `separator` below your items, you can include its size in the estimate.

Changing item span is useful when you have grid layouts (numColumns > 1) and you want few items to be bigger than the rest.

Modify the given layout. Do not return any value from the method. FlashList will fallback to default values if this is ignored.

:::warning Performance
This method is called very frequently. Keep it fast.
:::

### `overrideProps`

```ts
overrideProps?: object;
```

We do not recommend using this prop for anything else than debugging. Internal props of the list will be overriden with the provided values.

### `progressViewOffset`

```ts
progressViewOffset?: number;
```

Set this when offset is needed for the loading indicator to show correctly.

### `refreshControl`

```ts
refreshControl?: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
```

A custom refresh control element. When set, it overrides the default `<RefreshControl>` component built internally. The onRefresh and refreshing props are also ignored. Only works for vertical VirtualizedList.

### `refreshing`

```ts
refreshing?: boolean;
```

Set this true while waiting for new data from a refresh.

### `viewabilityConfig`

```ts
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

```ts
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

# FlashList methods

### `prepareForLayoutAnimationRender()`

```ts
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

### `scrollToEnd()`

```ts
scrollToEnd?: (params?: { animated?: boolean | null | undefined });
```

Scrolls to the end of the content.

### `scrollToIndex()`

```ts
scrollToIndex(params: {
  animated?: boolean | null | undefined;
  index: number;
  viewOffset?: number | undefined;
  viewPosition?: number | undefined;
});
```

Scroll to a given index.

### `scrollToItem()`

```ts
scrollToItem(params: {
  animated?: boolean | null | undefined;
  item: any;
  viewPosition?: number | undefined;
});
```

Scroll to a given item.

### `scrollToOffset()`

```ts
scrollToOffset(params: {
  animated?: boolean | null | undefined;
  offset: number;
});
```

Scroll to a specific content pixel offset in the list.

Param `offset` expects the offset to scroll to. In case of `horizontal` is true, the offset is the x-value, in any other case the offset is the y-value.

Param `animated` (`true` by default) defines whether the list should do an animation while scrolling.

# ScrollView props

`FlashList`, as `FlatList`, uses `ScrollView` under the hood. You can take a look into the React Native documentation for [`ScrollView`](https://reactnative.dev/docs/scrollview) to see the exhaustive list of props.

# Unsupported `FlatList` props

The following props from `FlatList` are currently not implemented:

- [`CellRendererComponent`](https://reactnative.dev/docs/virtualizedlist#cellrenderercomponent)
- [`columnWrapperStyle`](https://reactnative.dev/docs/flatlist#columnwrapperstyle)
- [`debug`](https://reactnative.dev/docs/virtualizedlist#debug)
- [`listKey`](https://reactnative.dev/docs/virtualizedlist#listkey)
- [`onScrollToIndexFailed`](https://reactnative.dev/docs/virtualizedlist#onscrolltoindexfailed)
- [`renderScrollComponent`](https://reactnative.dev/docs/virtualizedlist#renderscrollcomponent)
- [`windowSize`](https://reactnative.dev/docs/virtualizedlist#windowsize)

Unsupported methods:

- [`flashScrollIndicators()`](https://reactnative.dev/docs/flatlist#flashscrollindicators)
- [`hasMore`](https://reactnative.dev/docs/virtualizedlist#hasmore)
- [`getChildContext`](https://reactnative.dev/docs/virtualizedlist#getchildcontext)
- [`getNativeScrollRef()`​](https://reactnative.dev/docs/flatlist#getnativescrollref)
- [`getScrollableNode`](https://reactnative.dev/docs/virtualizedlist#getscrollablenode)
- [`getScrollRef`](https://reactnative.dev/docs/virtualizedlist#getscrollref)
- [`getScrollResponder()`](https://reactnative.dev/docs/flatlist#getscrollresponder)

There are also `FlatList` props that would bring no value if ported to `FlashList` due to the differences in their underlying implementation:

- [`disableVirtualization`](https://reactnative.dev/docs/virtualizedlist#disablevirtualization)
- [`getItemLayout`](https://reactnative.dev/docs/flatlist#getItemLayout)
- [`initialNumToRender`](https://reactnative.dev/docs/flatlist#initialnumtorender)
- [`maxToRenderPerBatch`](https://reactnative.dev/docs/virtualizedlist#maxtorenderperbatch)
- [`recordInteraction`](https://reactnative.dev/docs/virtualizedlist#recordinteraction)
- [`setNativeProps`](https://reactnative.dev/docs/virtualizedlist#setnativeprops)
- [`updateCellsBatchingPeriod`](https://reactnative.dev/docs/virtualizedlist#updatecellsbatchingperiod)

We don't currently plan to implement these props.
