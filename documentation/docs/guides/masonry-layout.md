---
id: masonry
title: Masonry Layout
---

Masonry Layout allows you to create a grid of items with different heights. It is a great way to display a collection of images with different sizes.

<div align="center">
<img src="https://user-images.githubusercontent.com/7811728/188055598-41f5c961-0dd0-4bb9-bc6e-22d78596a036.png" height="500"/>
</div>

To get started, import `MasonryFlashList` from `@shopify/flash-list` and use it just like you would use `FlashList`:

**Note:** `MasonryFlashList` will not compute most optimal arrangement for you. It will fit the items in the order they are provided.

## Unsupported Props

There are some props that `MasonryFlashList` does not support when compared to `FlashList`. These are:

- [`horizontal`](../fundamentals/usage.md#horizontal)
- [`keyExtractor`](../fundamentals/usage.md#keyextractor)
- [`inverted`](../fundamentals/usage.md#inverted)
- [`initialScrollIndex`](../fundamentals/usage.md#initialscrollindex)
- [`viewabilityConfigCallbackPairs`](../fundamentals/usage.md#viewabilityconfigcallbackpairs)
- [`onBlankArea`](../fundamentals/usage.md#onblankarea)

## Additional Props

There are some additional props that `MasonryFlashList` supports when compared to `FlashList`. These are:

### `getColumnSizeMultiplier`

```tsx
  getColumnSizeMultiplier?: (
    items: T[],
    columnIndex: number,
    maxColumns: number,
    extraData?: any
  ) => number | undefined;
```

Allows you to change the column widths of the list. This is helpful if you want some columns to be wider than the others.

Example:

```tsx
// if `numColumns` is 3, you can return 1.25 for index 1 and 0.75 for the rest to achieve a 1:2:1 split by width.
getColumnSizeMultiplier={(items, index, maxColumns, extraData) => {
    return index === 1 ? 0.75 * 2 : 0.75 * 1;
}}
```

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

Param `offset` expects the offset to scroll to.

Param `animated` (`false` by default) defines whether the list should do an animation while scrolling.
