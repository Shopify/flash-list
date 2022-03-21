---
id: usage
title: Usage 📝
slug: /usage
sidebar_position: 1
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

Most of the props from `FlatList` are available in `FlashList`, too. The behavior and usage of those props should be the same. You can read more about the props available in both `FlatList` and `FlashList` [here](https://reactnative.dev/docs/flatlist).

The following props from `FlatList` are currently not implemented:

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

We don't plan to implement these props.

# FlashList props

`FlashList` also has a couple of unique props. You already know about `estimatedItemSize` but there are more props available for minor adjustments.

### `estimatedItemSize`

```ts
estimatedItemSize: number;
```

Value of `estimatedItemSize` should ideally correspond to a median height or width of your cells - depending on your list's orientation. The size for vertical and horizontal lists will be translated to height and width, respectively.

### `estimatedListSize`

```ts
estimatedListSize?: { height: number; width: number }
```

Estimated visible height and width of the list. It is not the scroll content size.

### `estimatedFirstItemOffset`

```ts
estimatedFirstItemOffset?: number;
```

`estimatedFirstItemOffset` specifies how far the first item is drawn from start of the list window or offset of the first item of the list (not the header). This prop is necessary if you're using [initialScrollIndex](https://reactnative.dev/docs/flatlist#initialscrollindex) prop. Before the initial draw, the list does not know the size of a header or any special margin/padding that might have been applied using header styles etc. If this isn't provided initialScrollIndex might not scroll to the provided index.

### `drawDistance`

```ts
drawDistance?: number;
```

Draw distance for advanced rendering (in `dp`/`px`).

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

We do not recommend using this prop for anything else than debugging. Internal props of the list will be override with the provided values.

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

### `onLoad`

```ts
onLoad: (info: { elapsedTimeInMs: number }) => void;
```

This event is raised once the list has drawn items on the screen. It also reports elapsedTimeInMs which is the time it took to draw the items. This is required because FlashList doesn't render items in the first cycle. Items are drawn after it measures itself at the end of first render. If you're using ListEmptyComponent, this event is raised as soon as ListEmptyComponent is rendered.

# FlashList methods

```ts
prepareForLayoutAnimationRender(): void;
```

Run this method before running layout animations, such as when animating an element when deleting it. This method disable recycling for the next frame so that layout animations run well.

:::warning
Avoid this when making large changes to the data as the list might draw too much to run animations. Single item insertions/deletions should be good. With recycling paused the list cannot do much optimization. The next render will run as normal and reuse items.
:::
