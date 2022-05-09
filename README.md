[![Build status](./FlashList.png)](https://buildkite.com/shopify/flash-list)

<div align="center">
  <a href="https://shopify.github.io/flash-list/">Website</a> •
  <a href="https://shopify.github.io/flash-list/docs/">Getting started</a> •
  <a href="https://shopify.github.io/flash-list/docs/usage">Usage</a> •
  <a href="https://shopify.github.io/flash-list/docs/performance-troubleshooting">Performance</a> •
  <a href="https://shopify.github.io/flash-list/performant-components">Writing performant components</a> •
  <a href="https://shopify.github.io/flash-list/docs/known-issues">Known Issues</a>
<br><br>

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

See [full usage documentation](https://shopify.github.io/flash-list/docs/usage) to know better how to use FlashList.

## App / Playground

The [fixture](https://github.com/Shopify/flash-list/tree/main/fixture) is an example app showing how to use the library.
