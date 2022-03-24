---
id: estimated-item-size
title: Estimated Item Size Prop
slug: /estimated-item-size
sidebar_position: 2
---

## `estimatedItemSize` prop

### tl;dr

`estimatedItemSize` is a single numeric value that hints `FlashList` about the approximate size of the items before they're rendered. `FlashList` can then use this information to decide how many items it needs to draw on the screen before initial load and while scrolling. If most of the items are of *different sizes*, you can think of an average or median value and if most items are of *the same size*, just use that number. A quick look at `Element Inspector` can help you determine this.  If you're confused between two values, the smaller value is a better choice.

### Requirement

`FlashList` doesn't know the size of its children before they're rendered. When the list is loading it needs to decide how many items it wants to render. There are only few choices here:

- **Render x cells:** A default number of cells to initially render may not be right for all devices and it should ideally depend on screen size. Drawing less number of items will show up blank space on load and drawing too many will increase load time.
- **Assume a size:** If we use a default size for items on launch, we still run into problems. Let's say we use `50px` as the default, with you having no awareness of this, and you're rendering a list with large items like a news feed where items are also complex. Let's say the actual rendered size is around `500px`. Based on this assumption, we will draw `20` items on load if the screen size is `1000px` while we should only draw 2. This result is not optimal, and you may not even realize how much faster loads can be.
- **Take a hint from developers:** We leaned towards this option, instead of trying to hide away this requirement we're letting you decide. We're going with a size estimate and not an initial count to render because size seems like a more stable value across device sizes. We're open to feedback and suggestion here!

We're thinking of ways to workaround this limitation but for now we think that learning about this and providing a good value is better than providing suboptimal results.

### How to calculate

- If most items are of **similar heights** or widths (if horizontal), just open up element inspector from `react-native's` dev menu, check the size of one of the items, and use it. Don't worry about different devices. We have enough tolerance to work around it.
- If items **vary too much in sizes**, choose a few that are pretty different, use element inspector, and calculate an average. This average will work great, don't worry about solving for different devices sizes. There's enough tolerance internally.
- If you run into a situation where more than one value seems like a good fit pick the smaller one.

![Element Inspector](https://user-images.githubusercontent.com/7811728/159806998-ce6b0c27-576c-4fe1-8170-cfa23788cfae.png)


### Impact on scroll

During very quick scrolls, if offsets are changing very quickly, `FlashList` might run into a situation where it needs to prepare more than one item. This is just another version of the same problem. If your estimate is too big, `FlashList` might think that a small number of items are enough to fill the screen, and you might see blanks. _This is the primary reason we suggest using a smaller value if you're confused between the two of them._ Drawing a few more items is better than showing blanks. With `FlashList`, we don't expect blanks unless components are very slow or `estimatedItemSize` is too large.

### Impact of number of items drawn on responsiveness

Having few items on the screen is great for performance and responsiveness. Small render tree is much faster to update. Let's say there's a checkbox wthin your list items and you store their selected state in a store. You'd want this checkbox to be extremely responsive to check and uncheck. A large render tree will prevent that from happening. Many of you might have seen this problem in `FlatList`.

`FlatList` has a default `windowSize` of `21` which means that, on a `1000px` tall device, it will draw about `10,000px` at the bottom and at the top of currently visible window. `FlashList` in comparison will only draw `250px` extra on the top and bottom irrespective of the screen size. You will be amazed with how responsive things become when we have a very small number of items and that's why we care so much about it.

### Impact of having wrong `estimatedItemSize`

- Please note `FlashList` will not overlap or show gaps between items due to incorrect values provided here.
- **If values are too big**, you may see few items load on screen and then immediately more will show up. During fast scroll you may see some blank area. It's not because things have become slow. The list just doesn't know that it has not drawn enough. If your JS FPS is good and you still have blanks, it's most likely due to the `esimateItemSize` being too low. Once the list knows the size it won't rely on estimates and that's why on scrolling up you may not see the same problem.

![Large estimatedItemSize](https://user-images.githubusercontent.com/7811728/159801541-5540820d-4d90-491d-9645-dd43b684c437.png)

- **If the values are too small**, not much will change visibly but you will be drawing more than necessary. If your components are complex, load times might increase.

![Small estimatedItemSize](https://user-images.githubusercontent.com/7811728/159801594-51a26edc-8f5b-4fb5-a268-c138b525bd3c.png)

### Future Revisions

We're looking at ways to remove this requirement by leveraging `Fabric`. In the short term, we plan to compute this average after the initial load to prevent issues during quick scrolls. The value provided will be also more relevant for load time optimization.
