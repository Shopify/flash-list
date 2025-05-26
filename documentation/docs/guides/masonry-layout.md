---
id: masonry
title: Masonry Layout
---

Masonry Layout allows you to create a grid of items with different heights. It is a great way to display a collection of images with different sizes.

<div align="center">
<img src="https://user-images.githubusercontent.com/7811728/188055598-41f5c961-0dd0-4bb9-bc6e-22d78596a036.png" height="500"/>
</div>

## FlashList with masonry prop (v2)

In v2, masonry layout is enabled using the `masonry` prop on `FlashList`.

```tsx
import React from "react";
import { View, Text } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { DATA } from "./data";

const MyMasonryList = () => {
  return (
    <FlashList
      data={DATA}
      masonry
      numColumns={2}
      renderItem={({ item }) => <Text>{item.title}</Text>}
    />
  );
};
```

### With `overrideItemLayout`

When you want to customize item layout (such as setting different spans), you can use [`overrideItemLayout`](../fundamentals/usage.md#overrideitemlayout):

```tsx
import React from "react";
import { View, Text, Image } from "react-native";
import { FlashList } from "@shopify/flash-list";

interface MasonryItem {
  id: string;
  title: string;
  height: number;
  span: number; // Number of columns this item should span
  imageUrl: string;
}

const MyMasonryList = () => {
  return (
    <FlashList
      data={data}
      masonry
      numColumns={3}
      overrideItemLayout={(layout, item) => {
        // Set the span based on the item's span property
        layout.span = item.span;
        // Note: In v2, size estimates are no longer needed in overrideItemLayout
        // The actual height is determined by the rendered component
      }}
      renderItem={({ item }) => (
        <View style={{ backgroundColor: "#f0f0f0", margin: 4 }}>
          <Image source={{ uri: item.imageUrl }} style={{ flex: 1 }} />
          <Text>{item.title}</Text>
        </View>
      )}
      keyExtractor={(item) => item.id}
    />
  );
};
```

### `optimizeItemArrangement` prop

```tsx
optimizeItemArrangement?: boolean;
```

When enabled with `masonry` layout, this will try to reduce differences in column height by modifying item order. Default is `true`.

## Migration from v1

If you're migrating from v1's `MasonryFlashList`, here are the key changes:

1. **Use `FlashList` with `masonry` prop** instead of `MasonryFlashList`
2. **`overrideItemLayout` no longer needs size estimates** - only use it for setting `layout.span`
3. **`getColumnFlex` is not supported** in v2 masonry layout
4. **Item heights are determined by actual rendered component** rather than estimates
