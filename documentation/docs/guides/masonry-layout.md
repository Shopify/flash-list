---
id: masonry
title: Masonry Layout
---

Masonry Layout allows you to create a grid of items with different heights. It is a great way to display a collection of images with different sizes.

To get started, import `MasonryFlashList` from `@shopify/flash-list` and use it just like you would use `FlashList`:

**Note:** `MasonryFlashList` will not compute most optimal arrangement for you. It will fit the items in the order they are provided.

### Unsupported Props

There are some props that `MasonryFlashList` does not support when compared to `FlashList`. These are:

- [horizontal](../fundamentals/usage#horizontal)
