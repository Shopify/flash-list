---
id: recycling
title: Recycling
slug: /recycling
---

One important thing to understand is how `FlashList` works under the hood. When an item gets out of the viewport, instead of being destroyed, the component is re-rendered with a different `item` prop. For example, if you make use of `useState` in a reused component, you may see state values that were set for that component when it was associated with a different item in the list, and would then need to reset any previously set state when a new item is rendered:

```tsx
const MyItem = ({ item }) => {
  const lastItemId = useRef(item.someId);
  const [liked, setLiked] = useState(item.liked);
  if (item.someId !== lastItemId.current) {
    lastItemId.current = item.someId;
    setLiked(item.liked);
  }

  return (
    <Pressable onPress={() => setLiked(true)}>
      <Text>{liked}</Text>
    </Pressable>
  );
};
```

This follows advice in the [React Hooks FAQ on implementing getDerivedStateFromProps](https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops). Ideally your component hierarchy returned from [renderItem](../fundamentals/usage.md#renderitem) should not make use of `useState` for best performance.

When optimizing your item component, try to ensure as few things as possible have to be re-rendered and recomputed when recycling.
