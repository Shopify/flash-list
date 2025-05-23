---
id: performant-components
title: Writing performant components
---

While `FlashList` does its best to achieve high performance, it will still perform poorly if your item components are slow to render. In this post, let's dive deeper into how you can remedy this.

## Recycling

One important thing to understand is how `FlashList` works under the hood. When an item gets out of the viewport, instead of being destroyed, the component is re-rendered with a different `item` prop. When optimizing your item component, try to ensure as few things as possible have to be re-rendered and recomputed when recycling.

## Optimizations

There's lots of optimizations that are applicable for _any_ React Native component and which might help render times of your item components as well. Usage of `useCallback`, `useMemo`, and `useRef` is advised - but don't use these blindly, always [measure the performance](/performance-troubleshooting) before and after making your changes.

:::note
Always profile performance in the release mode. `FlashList`'s performance between JS dev and release mode differs greatly.
:::

### `estimatedItemSize`

Ensure [`estimatedItemSize`](/usage#estimateditemsize) is as close as possible to the real average value - see [here](/estimated-item-size#how-to-calculate) how to properly calculate the value for this prop.

### Remove `key` prop

:::warning
Using `key` prop inside your item and item's nested components will highly degrade performance.
:::

Make sure your **item components and their nested components don't have a `key` prop**. Using this prop will lead to `FlashList` not being able to recycle views, losing all the benefits of using it over `FlatList`.

For example, if we had a following item component:

```tsx
const MyNestedComponent = ({ item }) => {
  return <Text key={item.id}>I am nested!</Text>;
};

const MyItem = ({ item }) => {
  return (
    <View key={item.id}>
      <MyNestedComponent item={item} />
      <Text>{item.title}</Text>
    </View>
  );
};
```

Then the `key` prop should be removed from both `MyItem` and `MyNestedComponent`:

```tsx
const MyNestedComponent = ({ item }) => {
  return <Text>I am nested!</Text>;
};

const MyItem = ({ item }) => {
  return (
    <View>
      <MyNestedComponent item={item} />
      <Text>{item.title}</Text>
    </View>
  );
};
```

There might be cases where React forces you to use `key` prop, such as when using `map`. In such cirumstances, ensure that the `key` is not tied to the `item` prop in any way, so the keys don't change when recycling.

Let's imagine we want to display names of users:

```tsx
const MyItem = ({ item }: { item: any }) => {
  return (
    <>
      {item.users.map((user: any) => {
        <Text key={user.id}>{user.name}</Text>;
      })}
    </>
  );
};
```

If we wrote our item component like this, the `Text` component would need to be re-created. Instead, we can do the following:

```tsx
const MyItem = ({ item }) => {
  return (
    <>
      {item.users.map((user, index) => {
        /* eslint-disable-next-line react/no-array-index-key */
        <Text key={index}>{user.name}</Text>;
      })}
    </>
  );
};
```

Although using index as a `key` in `map` is not recommended by React, in this case since the data is derived from the list's data, the items will update correctly.

### Difficult calculations

If you do any calculations that might take a lot of resources, consider memoizing it, making it faster, or removing it altogether. The render method of items should be as efficient as possible:

### `getItemType`

**If you have different types of cell components and these are vastly different, consider leveraging the [`getItemType` prop](/usage#getitemtype)**. For example, if we were building a messages list, we could write it like this:

```tsx
// A message can be either a text or an image
enum MessageType {
  Text,
  Image,
}

interface TextMessage {
  text: string;
  type: MessageType.Text;
}

interface ImageMessage {
  image: ImageSourcePropType;
  type: MessageType.Image;
}

type Message = ImageMessage | TextMessage;

const MessageItem = ({ item }: { item: Message }) => {
  switch (item.type) {
    case MessageType.Text:
      return <Text>{item.text}</Text>;
    case MessageType.Image:
      return <Image source={item.image} />;
  }
};

// Rendering the actual messages list
const MessageList = () => {
  return <FlashList renderItem={MessageItem} estimatedItemSize={200} />;
};
```

However, this implementation has one performance drawback. When the list recycles items and the `MessageType` changes from `Text` to `Image` or vice versa, React won't be able to optimize the re-render since the whole render tree of the item component changes. We can fix this by changing the `MessageList` to this:

```tsx
const MessageList = () => {
  return (
    <FlashList
      renderItem={MessageItem}
      estimatedItemSize={200}
      getItemType={(item) => {
        return item.type;
      }}
    />
  );
};
```

`FlashList` will now use separate recycling pools based on `item.type`. That means we will never recycle items of different types, making the re-render faster.

### Leaf components

Let's consider the following example:

```tsx
const MyHeavyComponent = () => {
  return ...;
};

const MyItem = ({ item }) => {
  return (
    <>
      <MyHeavyComponent />
      <Text>{item.title}</Text>
    </>
  );
};
```

Since `MyHeavyComponent` does not directly depend on the `item` prop, `memo` can be used to skip re-rending `MyHeavyComponent` when the item is recycled and thus re-rendered:

```tsx
const MyHeavyComponent = () => {
  return ...;
};

const MyItem = ({ item }: { item: any }) => {
  const MemoizedMyHeavyComponent = memo(MyHeavyComponent);
  return (
    <>
      <MemoizedMyHeavyComponent />
      <Text>{item.title}</Text>
    </>
  );
};
```
