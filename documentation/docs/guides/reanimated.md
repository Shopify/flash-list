---
id: reanimated
title: React Native Reanimated
---

[React Native Reanimated](https://www.reanimated2.com/) is an alternative animation library to the [`LayoutAnimation`](https://reactnative.dev/docs/layoutanimation) API provided by React Native.

We support both view animations and the experimental [layout animations](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/layout_animations/).

For layout animations, similarly to the React Native API, you need to call [`prepareLayoutAnimationRender()`](/usage#prepareforlayoutanimationrender) before removing or inserting an element that you want to animate.

:::warning
We have not tested performance implications of using React Native Reanimated, nor compatibility with all the features it provides.

Use currently at your risk.
:::
