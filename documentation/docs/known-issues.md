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

### 3) `renderItem` callback doesn't have all features

As of now we only provide relevant data and index. No plans to change this.

### 4) Web support is in beta

- Layout is async so it's possible to see shift animations on list load.
- `onBlankArea` event and `useBlankAreaTracker` hook are not supported.

Exercise caution and make sure all changes are tested on web as there could be some differences when compared to Android/iOS.

### 5) `react-native-windows/macos` support

FlashList will run in JS only mode on both Windows and macOS. We don't have plans to write native code or actively test on platforms other than Android, iOS and Web.
