---
id: recycling
title: Recycling
slug: /recycling
---

It is important to understand how `FlashList` handles item rendering internally. When an item moves out of the viewport, instead of being unmounted, the component is re-rendered with a new `item` prop. This means that if you're using `useState` within the reused component, you might encounter state values that were set when the component was associated with a different item in the list. To avoid this, you'll need to reset any previous state when rendering a new item.

```tsx
const MyItem = ({ item }) => {
  const lastItemId = useRef(item.someId);
  const [liked, setLiked] = useState(item.liked);
  useEffect(() => {
    if (item.someId !== lastItemId.current) {
      lastItemId.current = item.someId;
      setLiked(item.liked);
    }
  }, [item.liked, item.someId]);

  return (
    <Pressable onPress={() => setLiked(true)}>
      <Text>{liked ? "👍" : "👎"}</Text>
    </Pressable>
  );
};
```

This will reset the state of each item when it is recycled, even the original item where the state was set. Ideally your component hierarchy returned from [renderItem](../fundamentals/usage.md#renderitem) should not make use of `useState` for best performance.

When optimizing your item component, try to ensure as few things as possible have to be re-rendered and recomputed when recycling.
