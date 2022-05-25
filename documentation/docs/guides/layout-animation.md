---
id: layout-animation
title: LayoutAnimation
---

[`LayoutAnimation`](https://reactnative.dev/docs/layoutanimation) is a popular way how to animate views in React Native.

FlashList does support `LayoutAnimation`s but you need to call [`prepareLayoutAnimationRender()`](/usage#prepareforlayoutanimationrender) before React Native's [`LayoutAnimation.configureNext`](https://reactnative.dev/docs/layoutanimation#configurenext). `prepareLayoutAnimationRender` is an instance method, so you have to keep a reference to your `FlashList` instance via the [`ref`](https://reactjs.org/docs/refs-and-the-dom.html) prop:

```tsx
// This must be called before `LayoutAnimation.configureNext` in order for the animation to run properly.
listRef.current?.prepareForLayoutAnimationRender();
// After removing the item, we can start the animation.
LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
```

For the animation to work properly, you additionally need to add [`keyExtractor`](/usage#keyextractor) prop to your `FlashList` component if you have not already done so.

:::note
`LayoutAnimation` is experimental on Android, so we cannot guarantee its stability when used with `FlashList`.
:::

## Example

```tsx
import React, { useRef, useState } from "react";
import { View, Text, Pressable, LayoutAnimation } from "react-native";
import { FlashList } from "@shopify/flash-list";

const List = () => {
  const [data, setData] = useState([1, 2, 3, 4, 5]);

  const list = useRef<FlashList<number> | null>(null);

  const removeItem = (item: number) => {
    setData(
      data.filter((dataItem) => {
        return dataItem !== item;
      })
    );
    // This must be called before `LayoutAnimation.configureNext` in order for the animation to run properly.
    list.current?.prepareForLayoutAnimationRender();
    // After removing the item, we can start the animation.
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const renderItem = ({ item }: { item: number }) => {
    return (
      <Pressable
        onPress={() => {
          removeItem(item);
        }}
      >
        <View>
          <Text>Cell Id: {item}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <FlashList
      // Saving reference to the `FlashList` instance to later trigger `prepareForLayoutAnimationRender` method.
      ref={list}
      // This prop is necessary to uniquely identify the elements in the list.
      keyExtractor={(item: number) => {
        return item.toString();
      }}
      renderItem={renderItem}
      estimatedItemSize={100}
      data={data}
    />
  );
};

export default List;
```
