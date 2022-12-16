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

### 6) iOS Image flickers on render of item

When you scroll down a FlashList of components containing images, on iOS it will show the incorrect image and flicker to the correct image once the correct URI is loaded. To avoid this, you need to check if the URI ref of the current item rendering is the URI of the image you want to render. If it is not, then you need to render a blank image and then render the correct image once the URI is loaded. An example
of this is shown on this [gist here](https://gist.githubusercontent.com/naqvitalha/f13772b7bc5d361fb95cdd008f47042b/raw/41992420e40512ce10ea6189fea4a71b43cf020e/RecyclableImage.tsx).

