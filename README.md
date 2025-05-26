![FlashList Image](./FlashList.png)

<div align="center">
  <a href="https://shopify.github.io/flash-list/">Website</a> •
  <a href="https://discord.gg/k2gzABTfav">Discord</a> •
  <a href="https://shopify.github.io/flash-list/docs/">Getting started</a> •
  <a href="https://shopify.github.io/flash-list/docs/usage">Usage</a> •
  <a href="https://shopify.github.io/flash-list/docs/fundamentals/performant-components">Writing performant components</a> •
  <a href="https://shopify.github.io/flash-list/docs/known-issues">Known Issues</a>
<br><br>

**Fast & performant React Native list. No more blank cells.**

Swap from FlatList in seconds. Get instant performance.

</div>

# FlashList v2

FlashList v2 has been rebuilt from the ground up for RN's new architecture and delivers fast performance, higher precision, and better ease of use compared to v1. We've achieved all this while moving to a JS-only solution! One of the key advantages of FlashList v2 is that it doesn't require any estimates. It also introduces several new features compared to v1.

> ⚠️ **IMPORTANT:** FlashList v2.x has been designed to fully leverage the new architecture. **Old architecture will only be supported while FlashList v2 is in alpha/beta/rc and will be dropped once it's ready.** When run on old architecture, we just fall back to v1.x which doesn't have any of the new features.

### Is v2 production ready?

Yes, please use one of the release candidates if you want to ship to production `2.0.0-rc.x`. While we can make some changes in the final version, we expect release candidates to be quite stable. Use the alpha track if you want to test new changes quickly and don't mind occasional bugs.

> ⚠️ **IMPORTANT:** FlashList v2.x's alpha track moves quickly and can have some issues. Please report any issues or edge cases you run into. We're actively working on testing and optimizing v2. We also highly recommend using it with RN 0.78+ for optimal performance.

### Old architecture / FlashList v1

If you're running on old architecture or using FlashList v1.x, you can access the documentation specific to v1 here: [FlashList v1 Documentation](https://shopify.github.io/flash-list/docs/1.x/).

### Web support

FlashList v2 has web support. Most of the features should work but we're not actively testing it right now. If you run into an issue, please raise it on GitHub.

## Installation

Add the package to your project via `yarn add @shopify/flash-list@rc` and run `pod install` in the `ios` directory.

## Usage

But if you are familiar with [FlatList](https://reactnative.dev/docs/flatlist), you already know how to use `FlashList`. You can try out `FlashList` by changing the component name or refer to the example below:

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
    />
  );
};
```

To avoid common pitfalls, you can also follow these steps for migrating from `FlatList`, based on our own experience:

1. Simply change from `FlatList` to `FlashList` and render the list.
2. **Important**: Scan your [`renderItem`](https://shopify.github.io/flash-list/docs/usage/#renderitem) hierarchy for explicit `key` prop definitions and remove them. If you’re doing a `.map()` use our hook called [`useMappingHelper`](https://shopify.github.io/flash-list/docs/usage/#usemappinghelper).
3. Check your [`renderItem`](https://shopify.github.io/flash-list/docs/usage/#renderitem) hierarchy for components that make use of `useState` and verify whether that state would need to be reset if a different item is passed to that component (see [Recycling](https://shopify.github.io/flash-list/docs/recycling))
4. If your list has heterogenous views, pass their types to `FlashList` using [`getItemType`](https://shopify.github.io/flash-list/docs/usage/#getitemtype) prop to improve performance.
5. Do not test performance with JS dev mode on. Make sure you’re in release mode. `FlashList` can appear slower while in dev mode due to a small render buffer.
6. Memoizing props passed to FlashList is more important in v2. v1 was more selective about updating items, but this was often perceived as a bug by developers. We will not follow that approach and will instead allow developers to ensure that props are memoized. We will stop re-renders of children wherever it is obvious.

## Other things to know

- `keyExtractor` is important to prevent glitches due to item layout changes when going upwards. We highly recommend having a valid `keyExtractor` with v2.
- `useLayoutState`: This is similar to `useState` but communicates the change in state to FlashList. It's useful if you want to resize a child component based on a local state. Item layout changes will still be detected using `onLayout` callback in the absence of `useLayoutState`, which might not look as smooth on a case-by-case basis.

  ```jsx
  import { useLayoutState } from "@shopify/flash-list";

  const MyItem = ({ item }) => {
    const [isExpanded, setIsExpanded] = useLayoutState(false);
    const height = isExpanded ? 150 : 80;

    return (
      <Pressable onPress={() => setIsExpanded(!isExpanded)}>
        <View style={{ height, padding: 16 }}>
          <Text>{item.title}</Text>
        </View>
      </Pressable>
    );
  };
  ```

- `useRecyclingState`: Similar to `useState` but accepts a dependency array. On change of deps, the state gets reset without an additional `setState` call. Useful for maintaining local item state if really necessary. It also has the functionality of `useLayoutState` built in.

  ```jsx
  import { useRecyclingState } from "@shopify/flash-list";

  const GridItem = ({ item }) => {
    const [isExpanded, setIsExpanded] = useRecyclingState(
      false,
      [item.id],
      () => {
        // runs on reset. Can be used to reset scroll positions of nested horizontal lists
      }
    );
    const height = isExpanded ? 100 : 50;

    return (
      <Pressable onPress={() => setIsExpanded(!isExpanded)}>
        <View style={{ height, backgroundColor: item.color }}>
          <Text>{item.title}</Text>
        </View>
      </Pressable>
    );
  };
  ```

- `useMappingHelper`: Returns a function that helps create optimal mapping keys for items when using `.map()` in your render methods. Using this ensures optimized recycling and performance for FlashList.

  ```jsx
  import { useMappingHelper } from "@shopify/flash-list";

  const MyComponent = ({ items }) => {
    const { getMappingKey } = useMappingHelper();

    return (
      <FlashList
        data={items}
        renderItem={({ item }) => <ItemComponent item={item} />}
      />
    );
  };

  // When mapping over items inside components:
  const NestedList = ({ items }) => {
    const { getMappingKey } = useMappingHelper();

    return (
      <View>
        {items.map((item, index) => (
          <Text key={getMappingKey(item.id, index)}>{item.title}</Text>
        ))}
      </View>
    );
  };
  ```

- If you're nesting horizontal FlashLists in vertical lists, we highly recommend the vertical list to be FlashList too. We have optimizations to wait for child layout to complete which can improve load times.

## App / Playground

The [fixture](./fixture/) is an example app showing how to use the library.
