---
id: performance-troubleshooting
title: Performance troubleshooting ⚡️
slug: /performance-troubleshooting
sidebar_position: 2
---

## Profiling

:::note
Before assessing whether list's performance is subpar, make sure you are in release mode. On Android, you can disable JS dev mode inside the developer menu, whereas you need to run the release configuration on iOS.
:::

For profiling the list's overall performance, you can use variety of tools and metrics.

For blank spaces, you can use the built-in [`onBlankArea`](/usage#onBlankArea) event. You can also use this event for tracking this metric in production. Alternatively, you can use [react-native-performance-lists-profiler](https://react-native-performance.docs.shopify.io/guides/react-native-performance-lists-profiler) package which also comes with a Flipper plugin. Apart from blank spaces, you can use the package to track TTI (time-to-interactive) of the list. This is a great option for local profiling - however, we do not recommend using it currently in production.

For FPS, you can either use the built-in performance monitor or we recommend [this](https://github.com/bamlab/react-native-performance) opensource plugin. Using native profilers in Xcode and Android Studio is a yet-another option.

## How to improve performance

If the numbers indicate that the performance is not good enough, you should act. `FlashList` is much more performant than `FlatList` because it recycles views instead of re-creating them as a user scrolls. But views still need to be rendered as they appear on the screen. Make sure your components are as light as possible without any resource-intensive logic. You can also use React's hooks such as `useMemo` or `useCallback` to further optimize your component.

To make your list more performant ensure [`estimatedItemSize`](/usage#estimateditemsize) is as close as possible to the real median value. And if you have different types of items, you can improve recycling by using the [`overrideItemType`](/usage#overrideitemtype) prop.

:::warning
Make sure your cell components don't have a `key` prop. Using this prop will lead to `FlashList` not being able to recycle views, losing all the benefits of using it over `FlatList`.
:::
