---
id: estimated-item-size
title: Estimated Item Size Prop
slug: /estimated-item-size
sidebar_position: 2
---

## `estimatedItemSize` prop

### tl;dr

`estimatedItemSize` provides a hint to `FlashList` about what the approximate size of the items will be after they're rendered. It can then use this information to decide how many items it needs to draw on the screen on load and while scrolling. If most of the sizes are different you can think of an average value and if most items are of the same size just use that number. A quick look at `Element Inspector` can help you determine this. If you're confused between two values using the smaller value is a better choice.

### Why is this prop needed?

`FlashList` doesn't know about the size of it's children before they're rendered. When the list is loading it need to decide how many it wants to render. There are only few choices here: - ** Assume a number ** - This number may not be right for all devices it should ideally depend on screen size. Draw less number of items will show up blank space on load and drawing too many will increase load time. - ** Assume a size ** - If we use a default size for items on launch we still nun into problems. Imagine if we decide 50px as the default you have no awareness of this assumption. If you are drawing a list with large items like a news feed where items are complex and large let's say 500px. Based on this assumption we will draw 20 items on load if screen size is 1000px while should only draw 2. This is not optimal and you may not even realize how much faster loads can be. - ** Take a hint from dev ** - We leaned towards this option, instead of trying to hide away this requirement we're letting you decide. We're going with a size estimate and not a number because size seems like a more stable value across device sizes.

We're thinking of ways to workaround this limitation but for now we think that learning about this and providing a good value is better than providing suboptimal results.

## How is this value used during scrolling?

During quick scrolls if positions are changing very quickly `FlashList` might run into situation where it needs to prepare more than one item. This is just another version of the same problem. If you estimate is too big `FlashList` might think that a small number of items are enough to fill the screens and you might end up seeing blanks. This is the primary reason we suggest using a smaller value if you're confused between two of them.
