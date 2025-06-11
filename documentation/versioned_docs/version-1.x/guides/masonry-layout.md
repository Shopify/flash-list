---
id: masonry
title: Masonry Layout
---

Masonry Layout allows you to create a grid of items with different heights. It is a great way to display a collection of images with different sizes.

<div align="center">
<img src="https://user-images.githubusercontent.com/7811728/188055598-41f5c961-0dd0-4bb9-bc6e-22d78596a036.png" height="500"/>
</div>

To get started, import `MasonryFlashList` from `@shopify/flash-list` and use it just like you would use `FlashList`:

```tsx
import React from "react";
import { View, Text, StatusBar } from "react-native";
import { MasonryFlashList } from "@shopify/flash-list";
import { DATA } from "./data";

const MyMasonryList = () => {
  return (
    <MasonryFlashList
      data={DATA}
      numColumns={2}
      renderItem={({ item }) => <Text>{item.title}</Text>}
      estimatedItemSize={200}
    />
  );
};
```

**Note:** If you want `MasonryFlashList` to optimize item arrangement, enable `optimizeItemArrangement` and pass a valid [`overrideItemLayout`](../fundamentals/usage.md#overrideitemlayout) function.

## Unsupported Props

There are some props that `MasonryFlashList` does not support when compared to `FlashList`:

- [`horizontal`](../fundamentals/usage.md#horizontal)
- [`inverted`](../fundamentals/usage.md#inverted)
- [`initialScrollIndex`](../fundamentals/usage.md#initialscrollindex)
- [`viewabilityConfigCallbackPairs`](../fundamentals/usage.md#viewabilityconfigcallbackpairs)
- [`onBlankArea`](../fundamentals/usage.md#onblankarea)

## Additional Props

`MasonryFlashList` supports these additional props on top of `FlashList`:

### `optimizeItemArrangement`

```tsx
optimizeItemArrangement?: boolean;
```

If enabled, MasonryFlashList will try to reduce difference in column height by modifying item order. If `true`, specifying [`overrideItemLayout`](../fundamentals/usage.md#overrideitemlayout) is required. Default value is `false`.

### `getColumnFlex`

```tsx
getColumnFlex?: (
  items: T[],
  columnIndex: number,
  maxColumns: number,
  extraData?: any
) => number;
```

`getColumnFlex` allows you to change the column widths of the list. This is helpful if you want some columns to be wider than the others.

Example:

```tsx
// if `numColumns` is `3`, you can return `2` for `index 1` and `1` for the rest to achieve a `1:2:1` split by width.
getColumnFlex={(items, index, maxColumns, extraData) => {
    return index === 1 ? 2 : 1;
}}
```

## Additional information in `renderItem` arguments

```tsx
export interface MasonryListRenderItemInfo<TItem>
  extends ListRenderItemInfo<TItem> {
  columnSpan: number;
  columnIndex: number;
}
```

When using `MasonryFlashList` the `renderItem` prop callback will be called with two additional properties on the `info` object.

`columnIndex`: A number representing the index of the column in which the item is rendered. When using `optimizeItemArrangement` this becomes more important as the items are no longer spread linearly across the columns.

`columnSpan`: A number representing how many columns a given item may span, for now this will always return `1`.

## Methods

`MasonryFlashList` exposes the some methods that `FlashList` does. These are:

### `scrollToEnd()`

```tsx
scrollToEnd?: (params?: { animated?: boolean | null | undefined });
```

Scrolls to the end of the content.

### `scrollToOffset()`

```tsx
scrollToOffset(params: {
  animated?: boolean | null | undefined;
  offset: number;
});
```

Scroll to a specific content pixel offset in the list.

Parameter `offset` expects the offset to scroll to.

Parameter `animated` (`false` by default) defines whether the list should animate while scrolling.
