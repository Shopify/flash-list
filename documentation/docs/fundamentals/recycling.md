---
id: recycling
title: Recycling
slug: /recycling
---

One important thing to understand is how `FlashList` works under the hood. When an item gets out of the viewport, instead of being destroyed, the component is re-rendered with a different `item` prop. For example, if you make use of `useState` in a reused component, you may see state values that were set for that component when it was associated with a different item in the list, and would then need to reset any previously set state when a new item is rendered.

FlashList now comes with `useRecyclingState` hook that can reset the state automatically without an additional render.

```tsx
const MyItem = ({ item }) => {
  // value of liked is reset if deps array changes. The hook also accepts a callback to reset anything else if required.
  const [liked, setLiked] = useRecyclingState(item.liked, [item.someId], () => {
    // callback
  });

  return (
    <Pressable onPress={() => setLiked(true)}>
      <Text>{liked}</Text>
    </Pressable>
  );
};
```

When optimizing your item component, try to ensure as few things as possible have to be re-rendered and recomputed when recycling.
