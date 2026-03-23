---
id: v2-migration
title: Migrating to v2
slug: /v2-migration
sidebar_position: 5
---

# Migrating from FlashList v1 to v2

This guide will help you migrate your existing FlashList v1 implementation to v2. FlashList v2 brings significant improvements in performance, developer experience, and new features while removing some deprecated props.

## Overview of Major Changes

- **New architecture is required** - v2 only works on top of React Native's new architecture
- **No more size estimates required** - FlashList v2 automatically handles all sizing
- **Masonry layout is now a prop** - MasonryFlashList component is deprecated
- **maintainVisibleContentPosition enabled by default** - Better scroll position handling

## Step-by-Step Migration

### Step 1: Update Package Version

```bash
npm install @shopify/flash-list@^2.0.0
# or
yarn add @shopify/flash-list@^2.0.0
```

### Step 2: Remove Deprecated Props

The following props have been deprecated and should be removed from your FlashList components:

#### Size Estimation Props (No Longer Needed!)

```diff
<FlashList
  data={data}
  renderItem={renderItem}
- estimatedItemSize={50}
- estimatedListSize={{ height: 400, width: 300 }}
- estimatedFirstItemOffset={0}
/>
```

#### Other Deprecated Props

```diff
<FlashList
  data={data}
  renderItem={renderItem}
- onBlankArea={handleBlankArea}  // No longer supported
- disableHorizontalListHeightMeasurement={true}  // No longer needed
- disableAutoLayout={true}  // No auto layout in v2
/>
```

### Step 3: Update Changed Props

#### overrideItemLayout

In v1, `overrideItemLayout` allowed both span changes and size estimates. In v2, it only supports span changes:

```diff
// v1
overrideItemLayout={(layout, item, index) => {
  layout.span = item.span;
- layout.size = 100; // No longer supported
}}

// v2
overrideItemLayout={(layout, item) => {
  layout.span = item.span; // Only span is supported
}}
```

### Step 4: Migrate MasonryFlashList to FlashList with masonry prop

```diff
// v1
- import { MasonryFlashList } from "@shopify/flash-list";

- <MasonryFlashList
-   data={data}
-   renderItem={renderItem}
-   numColumns={3}
-   estimatedItemSize={100}
- />

// v2
+ import { FlashList } from "@shopify/flash-list";

+ <FlashList
+   data={data}
+   renderItem={renderItem}
+   numColumns={3}
+   masonry
+ />
```

Note: `getColumnFlex` from MasonryFlashList is not supported in v2.

### Step 5: Update Ref Types

The ref type for FlashList has changed from `FlashList` to `FlashListRef`:

```diff
// v1
- import { FlashList } from "@shopify/flash-list";
- const listRef = useRef<FlashList<ItemType>>(null);

// v2
+ import { FlashList, FlashListRef } from "@shopify/flash-list";
+ const listRef = useRef<FlashListRef<ItemType>>(null);

<FlashList
  ref={listRef}
  data={data}
  renderItem={renderItem}
/>
```

### Step 6: Replace CellContainer with View

`CellContainer` is no longer exported in v2. Replace it with React Native's `View`. Apps forwarding custom `CellRendererComponent` might need this change.
