---
id: reanimated
title: React Native Reanimated
---

[React Native Reanimated](https://www.reanimated2.com/) is an alternative animation library to the [`LayoutAnimation`](https://reactnative.dev/docs/layoutanimation) API provided by React Native.

We support view animations and most of [layout animations](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/layout_animations/).

## Layout Animations

For layout animations, similarly to the React Native API, you need to call [`prepareLayoutAnimationRender()`](/usage#prepareforlayoutanimationrender) before removing or inserting an element that you want to animate. Note that we currently support only [entering](https://docs.swmansion.com/react-native-reanimated/docs/api/LayoutAnimations/entryAnimations) and [exiting](https://docs.swmansion.com/react-native-reanimated/docs/api/LayoutAnimations/exitAnimations) animations. **[Layout transitions](https://docs.swmansion.com/react-native-reanimated/docs/api/LayoutAnimations/layoutTransitions) are not supported** as of now.

## Hooks

### Usage

You can use hooks such as [`useSharedValue`](https://docs.swmansion.com/react-native-reanimated/docs/api/hooks/useSharedValue) as you would in a normal view. The difference is that since views get recycled, a value can transfer to an unrelated component. You will need to reset such values when a view is recycled - for this, you can pass a prop that uniquely identifies the cell (such as `id` of an item) and run a callback via `useEffect`. You can take inspiration from the following example:

```tsx
import React, { useEffect } from "react";
import Animated, { useSharedValue } from "react-native-reanimated";
import { FlashList } from "@shopify/flash-list";

const MyList = () => {
  const Item = ({ item }: { item: { id: string } }) => {
    const myValue = useSharedValue(0);
    useEffect(() => {
      // Reset value when id changes (view was recycled for another item)
      myValue.value = 0;
    }, [item.id, myValue]);
    return <Animated.View />;
  };

  return <FlashList renderItem={Item} estimatedItemSize={100} />;
};
```

### Performance

If you use hooks that accept a dependencies array, make sure to leverage it and include only the minimal set of dependencies.
