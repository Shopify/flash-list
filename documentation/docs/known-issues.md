---
id: known-issues
title: Known issues
slug: /known-issues
sidebar_position: 1
---

# Known Issues

RecyclerFlatList and FlatList have very different internal. While the API is almost the same, the behaviour might be different in some cases due to a bug, limitation or missing implementation. In any case, if the issue is already listed here don't create a new one.

### 1) List is not loading

`estimatedItemSize` is a required prop in RecyclerFlatList. Due to project setup sometimes typescript may not prompt you about this. This will be improved in the future with correct exceptions being thrown at the right places. As of now, this is the first thing you should check. Please note that you should provide average height for vertical lists and width for horizontal ones.

### 2) recyclerlistview requires a bounded size exception

RecyclerFlatList uses [recyclerlistview](https://github.com/Flipkart/recyclerlistview) to leverage recycling capability. `recyclerlistview` requires deterministic boundaries, this doesn't mean fixed height/width and could just be `flex:1`. It should mount with some height and width. Layout setups like `flex-start` on parent will not work. If you can't do this then a nice workaround is to use `estimatedListSize` prop. If your list is fullscreen, you can just pass `Dimensions.get("window")`. It's good to pass accurate values.

Please note most lists do mount with deterministic sizes so make sure to check if you really need workarounds.

### 3) Performance doesn't seem to improve

Please check if you are directly adding `key` prop to yours components or their children. If you directly add keys then it can break recycling and performance will not be as expected. Looks for usage of `key` inside whatever you are rendering (inclucing child components) and remove them. We are looking for feedback on why you might need to add keys (unless there is an iteration).

### 4) `Animated.event` doesn't work with `onScroll` event

This is something that hasn't been implemented yet. It will be part of the first full release. For now, you can listen to `onScroll` and update animated values imperatively.

### 5) `stickyHeaderIndices` isn't working

It's not implemented yet but will be part of final release.

### 6) `onEndReachedThreshold` value isn't working

Please note that value accepted is in dp/px and not a multiplier to window size. Please make the change accordingly. We will address this in the future.

### 7) `onEndReached` event doesn't have `distanceFromEnd`

This value is reported as 0. We don't have plans to implement this right now. Please provide feedback if this is important to you.

### 8)`scrollToIndex` doesn't have `offset` support

The list only guarantees to bring the given index in view port (as close to the top as possible). There is no support for additional customization.

### 9) `renderItem` callback doesn't have all features

As of now we only provide relevant data and index. No plans to change this.

### 10) `viewability` related callbacks are missing

We are planning to add a version of this but we can't guarantee if it will be exactly same a `FlatList`.

### 11) List header and item separator issues

Both of these don't work well with `numColumns >= 2`. It's just a bug that we have not fixed. You can try this but if there are issues just remove your header and item separators. Without `numColumns` these will work fine.

### 12) Horizontal lists do not change height to match tallest child

As of now horizontal lists need a fixed height. It's not possible to resize it based on height of the tallest child item. This is because children have absolute positions and cannot expand the parent. This is something we will address in the future. Please provide feedback if this is important to you. Using `onLayout` to measure and resize is a possible workaround but it can cause visible movement on screen.
