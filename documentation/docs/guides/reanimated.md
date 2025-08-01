---
id: reanimated
title: React Native Reanimated
---

[React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) is an alternative animation library to the [`LayoutAnimation`](https://reactnative.dev/docs/layoutanimation) API provided by React Native.

We support view animations and most of [layout animations](https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/layout-transitions/).

## Layout Animations

For layout animations, similarly to the React Native API, you need to call [`prepareLayoutAnimationRender()`](/usage#prepareforlayoutanimationrender) before removing or inserting an element that you want to animate.

## Hooks

### Usage

You can use hooks such as [`useSharedValue`](https://docs.swmansion.com/react-native-reanimated/docs/core/useSharedValue) as you would in a normal view. The difference is that since views get recycled, a value can transfer to an unrelated component. You will need to reset such values when a view is recycled - for this, you can pass a prop that uniquely identifies the cell (such as `id` of an item) and run a callback via `useEffect`. You can take inspiration from the following example:

```tsx
import React, { useEffect } from "react";
import Animated, { useSharedValue } from "react-native-reanimated";
import { FlashList } from "@shopify/flash-list";

const Item = ({ item }: { item: { id: string } }) => {
  const myValue = useSharedValue(0);
  useEffect(() => {
    // Reset value when id changes (view was recycled for another item)
    myValue.value = 0;
  }, [item.id, myValue]);
  return <Animated.View />;
};

const MyList = () => {
  return <FlashList renderItem={Item} />;
};
```

### Performance

If you use hooks that accept a dependencies array, make sure to leverage it and include only the minimal set of dependencies.
