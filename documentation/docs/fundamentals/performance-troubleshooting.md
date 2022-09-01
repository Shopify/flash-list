---
id: performance-troubleshooting
title: Performance troubleshooting
slug: /performance-troubleshooting
sidebar_position: 1
---

## Profiling

:::warning
Before assessing your list's performance, make sure you are in release mode. On Android, you can disable JS dev mode inside the developer menu, whereas you need to run the release configuration on iOS.
FlashList can appear to be slower than FlatList in dev mode. The primary reason is a much smaller and fixed [window size](https://reactnative.dev/docs/virtualizedlist#windowsize) equivalent. Click [here](https://reactnative.dev/docs/performance#running-in-development-mode-devtrue) to know more about why you shouldn't profile with dev mode on.
:::

The following metrics can be used for profiling the list's overall performance:

- **blank area - a size of a visible blank area on scroll.** Use the built-in [`onBlankArea`](/usage#onBlankArea) event to get it reported. You can also use this event for tracking this metric in production. Alternatively, you can use [react-native-performance-lists-profiler](https://shopify.github.io/react-native-performance/docs/guides/react-native-performance-lists-profiler/) package which also comes with a Flipper plugin.
- **TTI - time-to-interactive of the list.** Comes along with blank area as part of [react-native-performance-lists-profiler](https://shopify.github.io/react-native-performance/docs/guides/react-native-performance-lists-profiler/) package. This is a great option for local profiling - however, we do not recommend using it currently in production.
- **FPS - frames per second.** For both native and JS FPS, you can either use the built-in performance monitor or we recommend [this](https://github.com/bamlab/react-native-performance) opensource plugin. Using native profilers in Xcode and Android Studio is a yet-another option but they track only the native FPS.

## How to improve performance

If the numbers indicate that the performance is not good enough, you should act - **continue [here](/fundamentals/performant-components) to learn more about how to optimize your list.**
