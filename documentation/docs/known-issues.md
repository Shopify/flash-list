---
id: known-issues
title: Known issues
slug: /known-issues
sidebar_position: 3
---

# Known Issues

FlashList and FlatList have very different internal. While the API is almost the same, the behaviour might be different in some cases due to a bug, limitation or missing implementation. In any case, if the issue is already listed here don't create a new one.

### 1) FlashList's rendered size is not usable warning

`FlashList` uses [recyclerlistview](https://github.com/Flipkart/recyclerlistview) to leverage its recycling capability. `recyclerlistview's` default layout algorithm cannot work without a valid size. It needs to first measure itself and then decide how much to draw and reuse. So, make sure that the parent of the list mounts with a valid size (>=2px) and `FlashList` will match the size of its parent. Please note that you cannot apply style directly to `FlashList` so you may need to wrap it in a `View`.

Please note most lists do mount with deterministic sizes so make sure to check if you really need workarounds.

### 2) `onEndReached` event doesn't have `distanceFromEnd`

This value is reported as 0. We don't have plans to implement this right now. Please provide feedback if this is important to you.

### 3)`scrollToIndex` doesn't have `offset` support

The list only guarantees to bring the given index in view port (as close to the top as possible). There is no support for additional customization.

### 4) `renderItem` callback doesn't have all features

As of now we only provide relevant data and index. No plans to change this.

### 5) `viewability` related callbacks are missing

We are planning to add a version of this but we can't guarantee if it will be exactly same a `FlatList`.

### 6) Horizontal lists do not change height to match tallest child

As of now, horizontal lists need a fixed height. It's not possible to resize it based on height of the tallest child item. This is because children have absolute positions and cannot expand the parent. This is something we will address in the future. Please provide feedback if this is important to you. Using `onLayout` to measure and resize is a possible workaround but it can cause visible movement on screen.

### 7) Layout animations for insert and delete operations may start from wrong coordinates

These animations aren't supported right now but we're looking into them.
