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

This is a comprehensive list of supported `FlashList` props. Some of them might be familiar from `FlatList` [props](https://reactnative.dev/docs/flatlist). Not all of them are available in `FlashList` and for some the documentation and behavior might slightly differ. We therefore recommend using our documentation as the primary reference.

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

Value of `estimatedItemSize` should ideally correspond to a median height or width of your cells - depending on your list's orientation. The size for vertical and horizontal lists will be translated to height and width, respectively.

---

### `ItemSeparatorComponent`

Rendered in between each item, but not at the top or bottom. By default, `highlighted` and `leadingItem` props are provided.

```ts
ItemSeparatorComponent?: React.ComponentType<any>;
```

---

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

### `drawDistance`

```ts
drawDistance?: number;
```

Draw distance for advanced rendering (in `dp`/`px`).

### `estimatedFirstItemOffset`

```ts
estimatedFirstItemOffset?: number;
```

`estimatedFirstItemOffset` specifies how far the first item is drawn from start of the list window or offset of the first item of the list (not the header). This prop is necessary if you're using [initialScrollIndex](https://reactnative.dev/docs/flatlist#initialscrollindex) prop. Before the initial draw, the list does not know the size of a header or any special margin/padding that might have been applied using header styles etc. If this isn't provided initialScrollIndex might not scroll to the provided index.

### `estimatedListSize`

```ts
estimatedListSize?: { height: number; width: number }
```

Estimated visible height and width of the list. It is not the scroll content size.

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

When [numColumns](https://reactnative.dev/docs/flatlist#numcolumns) is greater than 1, you can choose to increase span of some of the items. You can also modify estimated height for some items. Instead of returning the layout from the method, modify it in-place.
:::warning Performance
This method is called very frequently. Keep it fast.
:::

### `overrideProps`

```ts
overrideProps?: object;
```

We do not recommend using this prop for anything else than debugging. Internal props of the list will be overriden with the provided values.

# FlashList methods

### `prepareForLayoutAnimationRender`

```ts
prepareForLayoutAnimationRender(): void;
```

Run this method before running layout animations, such as when animating an element when deleting it. This method disables recycling for the next frame so that layout animations run well.

:::warning
Avoid using this when making large changes to the data as the list might draw too much to run animations since the method disables recycling temporarily. Single item insertions or deletions should animate smoothly. The render after animation will enable recycling again and you can stop avoiding making large data changes.
:::

# ScrollView props

`FlashList`, as `FlatList` uses `ScrollView` under the hood. But we currently support only a subset of [`ScrollView`](https://reactnative.dev/docs/scrollview) props that you can find below.

### `horizontal`

```ts
horizontal?: boolean;
```

When `true`, the scroll view's children are arranged horizontally in a row instead of vertically in a column.

### `refreshControl`

```ts
refreshControl?: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
```

A `RefreshControl` component, used to provide pull-to-refresh functionality for the `ScrollView`. Only works for vertical ScrollViews (`horizontal` prop must be `false`).

See [RefreshControl](https://reactnative.dev/docs/refreshcontrol) for more details.

# ScrollView methods

### `scrollToEnd()`

```ts
scrollToEnd(params?: { animated?: boolean | null | undefined });
```

If this is a vertical ScrollView scrolls to the bottom. If this is a horizontal ScrollView scrolls to the right.

Use `scrollToEnd({ animated: true })` for smooth animated scrolling, `scrollToEnd({ animated: false })` for immediate scrolling. If no options are passed, `animated` defaults to `true`.

# Unsupported `FlatList` props

The following props from `FlatList` and `ScrollView` (which `FlatList` inherits) are currently not implemented:

- [`columnWrapperStyle`](https://reactnative.dev/docs/flatlist#columnwrapperstyle)
- [`viewabilityConfig`](https://reactnative.dev/docs/flatlist#viewabilityconfig)
- [`onViewableItemsChanged`](https://reactnative.dev/docs/flatlist#onviewableitemschanged)
- [`viewabilityConfigCallbackPairs`](https://reactnative.dev/docs/flatlist#viewabilityconfigcallbackpairs)
- [`flashScrollIndicators()`](https://reactnative.dev/docs/flatlist#flashscrollindicators)
- [`getNativeScrollRef()`​](https://reactnative.dev/docs/flatlist#getnativescrollref)
- [`getScrollResponder()`](https://reactnative.dev/docs/flatlist#getscrollresponder)
- [`recordInteraction()`](https://reactnative.dev/docs/flatlist#recordinteraction)

There are also `FlatList` props that would bring no value if ported to `FlashList` due to the differences in their underlying implementation:

- [`initialNumToRender`](https://reactnative.dev/docs/flatlist#initialnumtorender)
- [`getItemLayout`](https://reactnative.dev/docs/flatlist#getItemLayout)

We don't currently plan to implement these props.
