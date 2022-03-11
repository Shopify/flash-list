---
id: known-issues
title: Known issues
slug: /known-issues
sidebar_position: 3
---

# Known Issues

FlashList and FlatList have very different internal. While the API is almost the same, the behaviour might be different in some cases due to a bug, limitation or missing implementation. In any case, if the issue is already listed here don't create a new one.

### 1) recyclerlistview requires a bounded size exception

`FlashList` uses [recyclerlistview](https://github.com/Flipkart/recyclerlistview) to leverage recycling capability. `recyclerlistview` requires deterministic boundaries, this doesn't mean fixed height/width and could just be `flex: 1`. It should mount with some height and width. Layout setups like `flex-start` on parent will not work. If you can't do this then a nice workaround is to use `estimatedListSize` prop. If your list is fullscreen, you can just pass `Dimensions.get("window")`. It's good to pass accurate values.

Please note most lists do mount with deterministic sizes so make sure to check if you really need workarounds.

### 2) `Animated.event` doesn't work with `onScroll` event

This is something that hasn't been implemented yet. It will be part of the first full release. For now, you can listen to `onScroll` and update animated values imperatively.

### 3) `stickyHeaderIndices` isn't working

It's not implemented yet but will be part of final release.

### 4) `onEndReached` event doesn't have `distanceFromEnd`

This value is reported as 0. We don't have plans to implement this right now. Please provide feedback if this is important to you.

### 5)`scrollToIndex` doesn't have `offset` support

The list only guarantees to bring the given index in view port (as close to the top as possible). There is no support for additional customization.

### 6) `renderItem` callback doesn't have all features

As of now we only provide relevant data and index. No plans to change this.

### 7) `viewability` related callbacks are missing

We are planning to add a version of this but we can't guarantee if it will be exactly same a `FlatList`.

### 8) Horizontal lists do not change height to match tallest child

As of now, horizontal lists need a fixed height. It's not possible to resize it based on height of the tallest child item. This is because children have absolute positions and cannot expand the parent. This is something we will address in the future. Please provide feedback if this is important to you. Using `onLayout` to measure and resize is a possible workaround but it can cause visible movement on screen.
