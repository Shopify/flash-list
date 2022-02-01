# Known Issues

RFL and FlatList have very different internal. While the API is almost the same, the behaviour might be different in some cases due to a bug, limitation or missing implementation. In any case, if the issue is already listed here don't create a new one.

### 1) List is not loading

`estimatedItemSize` is a required prop in RFL. Due to project setup sometimes typescript may not prompt you about this. This will be improved in the future with exceptions. As of now, this is the first thing you should check. Please note provide average height for vertical lists and width for horizontal ones.

### 2) recyclerlistview requires a bounded size exception

RFL uses [recyclerlistview](https://github.com/Flipkart/recyclerlistview) to leverage recycling capability. `recyclerlistview` required deterministic boundaries, this doesn't mean fixed height/width and could just be `flex:1`. It should mount with some height and width. Layout setups like `flex-start` on parent will not work. If you can't do this then a nice workaround to this is to use `estimatedListSize` prop. If your list is fullscreen, you can just pass `Dimensions.get("window")`. It's good to pass accurate values.

Please note most lists do mount this deterministic sizes so please do check if you really need workarounds.

### 3) `Animated.event` doesn't work with `onScroll` event

This is something that hasn't been implemented yet. It will be part of the first full release. For now, you can listen to `onScroll` and update animated values imperatively.

### 4) `stickyHeaderIndices` isn't working

It's not implemented yet but will be part of final release.

### 5) `onEndReachedThreshold` value isn't working

Please note that value accepted is in dp/px and not a multiplier to window size. Please make the change accordingly. We will address this in the future.

### 6) `onEndReached` event doesn't have `distanceFromEnd`

This value is reported as 0. We don't have plans to implement this right now. Please provide feedback if this is important to you.

### 7)`scrollToIndex` doesn't have `offset` support

The list only guarantees to bring the given index in view port (as close to the top as possible). There is no support for additional customization.

### 8) `renderItem` callback doesn't have all features

As of now we only provide relevant data and index. No plans to change this.

### 9) `viewability` related callbacks are missing

We are planning to add a version of this but we can't guarantee if it will be exactly same a `FlatList`.
