![FlashList Image](./FlashList.png)

# FlashList v2

FlashList v2 has been rebuilt from the ground up and delivers fast performance, higher precision, and better ease of use compared to v1. We've achieved all this while moving to a JS-only solution! One of the key advantages of FlashList v2 is that it doesn't require any estimates. It also introduces several new features compared to v1.

## React Native's old architecture support

> ⚠️ **IMPORTANT:** FlashList v2.x has been designed to fully leverage the new architecture. Old architecture will be supported while FlashList v2 is in alpha/beta and will be dropped once it's ready. When run on old architecture, we just fall back to v1.x.

## Web support

Web support might be added sometime in the future. We plan on shipping the RN version first.

## Installation

Add the package to your project via `yarn add @shopify/flash-list` and run `pod install` in the `ios` directory.

## Usage

We recommend reading the detailed documentation for using `FlashList` [here](https://shopify.github.io/flash-list/docs/usage).

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

## New props

- `masonry`: Enable masonry layout for grid-like interfaces with varying item heights.

  ```jsx
  <FlashList
    data={data}
    masonry
    numColumns={3}
    renderItem={({ item }) => <MasonryItem item={item} />}
  />
  ```

- `optimizeItemArrangement`: When enabled, MasonryFlashList will try to reduce differences in column height by modifying item order.
- `onStartReached`: Called when the scroll position gets within `onStartReachedThreshold` of the start of the content.

  ```jsx
  <FlashList
    data={messageData}
    onStartReached={() => loadOlderMessages()}
    onStartReachedThreshold={0.1}
    renderItem={({ item }) => <MessageItem message={item} />}
  />
  ```

- `onStartReachedThreshold`: How far from the start the top edge of the list must be to trigger `onStartReached`.
- `disableRecycling`: If true, the FlashList will not recycle items.
- `style`: Style for the FlashList's parent container. Avoid properties that affect children size (margin is okay, padding is not).
- `maintainVisibleContentPosition`: Configuration for maintaining scroll position when content changes:
  - `disabled`: Set to true to disable this feature (enabled by default).
  - `autoscrollToTopThreshold`: Automatically scroll to maintain position when content is added at the top.
  - `autoscrollToBottomThreshold`: Automatically scroll to maintain position when content is added at the bottom.
  - `startRenderingFromBottom`: If true, initial render will start from the bottom, useful for chat interfaces.
  ```jsx
  <FlashList
    data={chatMessages}
    maintainVisibleContentPosition={{
      autoscrollToBottomThreshold: 10,
      startRenderingFromBottom: true,
    }}
    renderItem={({ item }) => <ChatMessage message={item} />}
  />
  ```
- `onCommitLayoutEffect`: Called before layout is committed. Can be used to measure list and make changes before paint. Doing setState inside the callback can lead to infinite loops. Make sure FlashList's props are memoized.

## Deprecated (will be removed after alpha/beta)

- `estimatedItemSize`: No longer used.
- `estimatedListSize`: No longer used.
- `estimatedFirstItemOffset`: No longer used.
- `inverted`: We have added `maintainVisibleContentPosition` support, so we don't want to maintain inverted mode.
- `onBlankArea`: We don't have plans to add or continue supporting this prop.
- `disableHorizontalListHeightMeasurement`: No longer needed.
- `disableAutoLayout`: There's no auto layout in v2.
- `MasonryFlashList` will be replaced by `masonry` prop.
- `getColumnFlex` from `MasonryFlashList` will not be supported in FlashList v2 with `masonry` prop.

## Changed props

- `overrideItemLayout`: In v2, this allows a way to change the span of items. Span is supported, but we no longer read the size estimates.
  ```jsx
  <FlashList
    data={gridData}
    numColumns={2}
    overrideItemLayout={(layout, item) => {
      layout.span = item.span; // Set span to 1 or 2
    }}
    renderItem={({ item }) => <GridItem item={item} />}
  />
  ```

## New features

- `masonry` is now a prop on FlashList. It's now also possible to use `overrideItemLayout` with `masonry`.
- `maintainVisibleContentPosition` is available and now enabled by default. We use this to reduce visible glitches as much as possible. Chat apps without inverted will also be possible. Please note that if you plan on adding a large number of rows on top of the list, then you may want to increase the drawDistance on the list.
- `onStartReached` callback is now available with a configurable threshold.
- We've added support for RTL layouts.

## Improvements

- `scrollToIndex` and `scrollToItem` are much more precise.
- Scrolling upwards after orientation change doesn't cause layout glitches. The same is true for scrolling to items and scrolling upwards.
- `stickyHeaders` use an Animated implementation, so minor gaps between them while scrolling aren't visible anymore.
- FlashList does not ask for any estimates, which makes it much easier to use.
- Horizontal Lists are much improved, and items can also resize within the lists. We no longer render an extra item to measure list height.
- In Grid layout, if side-by-side items have different heights, then the shorter item will match the height of the tallest item. This wasn't possible in v1.
- The ref of FlashList has many more useful methods like `getVisibleIndices` and `getLayout`.
- `contentContainerStyle` prop is fully supported now.
- `style` prop is applied to the parent for FlashList. We highly recommend not adding padding which can impact the size of the ScrollView inside. We operate on the assumption that the size of parent view and ScrollView is the same.

## Things to know

- Avoid adding keys directly to components which can break recycling. Same as v1.
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

- `useRecyclingState`: Similar to `useState` but accepts a dependency array. On change of deps, the state gets reset without an additional setState call. Useful for maintaining local item state if really necessary. It also has the functionality of `useLayoutState` built in.

  ```jsx
  import { useRecyclingState } from "@shopify/flash-list";

  const GridItem = ({ item }) => {
    const [isExpanded, setIsExpanded] = useRecyclingState(false, [item.id]);
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

- If you're nesting horizontal FlashLists in vertical lists, we highly recommend the vertical list to be FlashList too. We have optimizations to wait for child layout to complete which can improve load times.
- For chat apps, consider increasing drawDistance to 500 or higher if you're going to add a lot of items to the top. Higher drawDistance can remove some flickers. 500-1000 for chat can be okay. We would like to hear from you if you run into issues.

## App / Playground

The [fixture](https://github.com/Shopify/flash-list/tree/main/fixture) is an example app showing how to use the library.
