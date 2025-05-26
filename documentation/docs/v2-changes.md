---
id: v2-changes
title: What's new in v2
slug: /v2-changes
sidebar_position: 4
---

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

- `optimizeItemArrangement`: When enabled, masonry layout will try to reduce differences in column height by modifying item order.
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
- `maxItemsInRecyclePool`: Maximum number of items in the recycle pool (Not required unless the number of item types is huge).
- `style`: Style for the FlashList's parent container. We highly recommend not adding padding which can impact the size of the ScrollView inside. We operate on the assumption that the size of parent view and ScrollView is the same. In most cases, `contentContainerStyle` should be enough so avoid using this.
- `maintainVisibleContentPosition`: Configuration for maintaining scroll position when content changes:
  - `disabled`: Set to true to disable this feature (enabled by default).
  - `autoscrollToTopThreshold`: Automatically scroll to maintain position when content is added at the top.
  - `autoscrollToBottomThreshold`: Automatically scroll to maintain position when content is added at the bottom.
  - `startRenderingFromBottom`: If true, initial render will start from the bottom, useful for chat interfaces.
  ```jsx
  <FlashList
    data={chatMessages}
    maintainVisibleContentPosition={{
      autoscrollToBottomThreshold: 0.2,
      startRenderingFromBottom: true,
    }}
    renderItem={({ item }) => <ChatMessage message={item} />}
  />
  ```
- `onCommitLayoutEffect`: Called before layout is committed. Can be used to measure list and make changes before paint. Doing setState inside the callback can lead to infinite loops. Make sure FlashList's props are memoized.

## Changed props

- `overrideItemLayout`: This used to allow a way to change the span of items and provide size estimates. In v2, span is supported, but we no longer read the size estimates.
  ```jsx
  <FlashList
    data={gridData}
    numColumns={2}
    overrideItemLayout={(layout, item) => {
      layout.span = item.span; // Set span
    }}
    renderItem={({ item }) => <GridItem item={item} />}
  />
  ```

## New features

- `masonry` is now a prop on FlashList. It's now also possible to use `overrideItemLayout` with `masonry`.
- `maintainVisibleContentPosition` is available and now enabled by default. We use this to reduce visible glitches as much as possible. Chat apps without inverted will also be possible. Please note that if you plan on adding a large number of rows on top of the list, then you may want to increase the drawDistance on the list.
- `onStartReached` callback is now available with a configurable threshold.
- We've also added support for RTL layouts.

## Improvements

- `scrollToIndex` and `scrollToItem` are much more precise.
- Scrolling upwards after orientation change doesn't cause layout glitches. The same is true for scrolling to items and scrolling upwards.
- `stickyHeaders` use an Animated implementation, so minor gaps between them while scrolling aren't visible anymore.
- FlashList does not ask for any estimates, which makes it much easier to use.
- Horizontal Lists are much improved, and items can also resize within the lists. We no longer render an extra item to measure list height.
- In Grid layout, if side-by-side items have different heights, then the shorter item will match the height of the tallest item. This wasn't possible in v1.
- The ref of FlashList has many more useful methods like `getVisibleIndices` and `getLayout`.
- `contentContainerStyle` prop is fully supported now.

## New hooks

### useLayoutState

This is similar to `useState` but communicates the change in state to FlashList. It's useful if you want to resize a child component based on a local state. Item layout changes will still be detected using `onLayout` callback in the absence of `useLayoutState`, which might not look as smooth on a case-by-case basis.

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

### useRecyclingState

Similar to `useState` but accepts a dependency array. On change of deps, the state gets reset without an additional `setState` call. Useful for maintaining local item state if really necessary. It also has the functionality of `useLayoutState` built in.

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

### useMappingHelper

Returns a function that helps create optimal mapping keys for items when using `.map()` in your render methods. Using this ensures optimized recycling and performance for FlashList.

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
