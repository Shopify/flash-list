[![Build status](./FlashList.png)](https://buildkite.com/shopify/flash-list)

<div align="center">
[Website](https://shpoify.github.io/flash-list) • [Getting started](https://flash-list.docs.shopify.io/) • [Usage](https://flash-list.docs.shopify.io/usage) • [Performance](https://flash-list.docs.shopify.io/performance-troubleshooting) • [Known Issues](https://flash-list.docs.shopify.io/known-issues)

**Fast & performant React Native list. No more blank cells.**

Swap from FlatList in seconds. Get instant performance.

</div>

## Installation

Add the package to your project via `yarn add @shopify/flash-list` and run `pod install` in the `ios` directory.

## Usage

If you are familiar with [FlatList](https://reactnative.dev/docs/flatlist), you already know how to use `FlashList`. You can try out `FlashList` just by changing the component name and adding `estimatedItemSize` or refer to the example below:

```jsx
import React from "react";
import { View, Text } from "react-native";
import { FlashList } from "@shopify/flash-list";

const DATA = [
  {
    title: "First Item",
  },
  {
    title: "Second Item",
  },
];

const MyList = () => {
  return (
    <FlashList
      data={DATA}
      renderItem={({ item }) => <Text>{item.title}</Text>}
      estimatedItemSize={200}
    />
  );
};
```

See [full usage documentation](https://flash-list.docs.shopify.io/usage) to know better how to use FlashList.

## App / Playground

The [fixture](https://github.com/Shopify/flash-list/tree/main/fixture) is an example app showing how to use the library.
