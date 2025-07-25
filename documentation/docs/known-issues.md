---
id: known-issues
title: Known issues
slug: /known-issues
sidebar_position: 3
---

# Known Issues

FlashList and FlatList have very different internals. While the API is almost the same, the behaviour might be different in some cases due to a bug, limitation or missing implementation. In any case, if the issue is already listed here don't create a new one.

### 1) Horizontal lists + RTL Layout

We have a limitation where we're not able to read the padding applied on the list using `contentContainerStyle`. Small values shouldn't cause an issue; however, if you require precise `scrollTo` or `initialScrollIndex`, then apply padding or margin to the header instead. Please note that this applies only to RTL language layouts.

### 2) Horizontal Lists with headers

If the horizontal list has a fixed size or header, we assume that the height of the list is fixed. If your use case requires the list to match the size of the items or resize based on tallest child, just skip using the header. You can just render the header as the first item in the list and give it a separate type using `getItemType`.

### 3) Data re-ordering can cause items to move

This is because `maintainVisibleContentPosition` is enabled by default. If you're running into this then you can disable it by setting `maintainVisibleContentPosition={{disabled:true}}`. Having it enabled by default allows us to handle any layout changes while scrolling upwards in a better way like after an orientation change or a large scroll jump to the last item.
