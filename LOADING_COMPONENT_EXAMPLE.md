# LoadingComponent Feature

## Overview

The `LoadingComponent` feature addresses GitHub Issue #1979 by providing a clean, built-in way to display loading states in FlashList without visual glitches or complex workarounds.

## Problem Solved

Previously, developers had to use awkward workarounds to show loading states:
- Using `ListEmptyComponent` with loading state (not ideal, leads to bugs)
- Using `renderItem` (complicated to manage)
- Conditionally rendering the entire FlashList (causes visual glitches)

## Solution

FlashList now supports two new props:
- `LoadingComponent`: The component to render during loading
- `isLoading`: Boolean flag to control when loading is shown

## Usage

### Basic Example

```tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';

const LoadingSkeleton = () => (
  <View style={{ padding: 20, alignItems: 'center' }}>
    <ActivityIndicator size="large" />
    <Text>Loading items...</Text>
  </View>
);

const MyList = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://api.example.com/items');
      const items = await response.json();
      setData(items);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FlashList
      data={data}
      isLoading={isLoading}
      LoadingComponent={<LoadingSkeleton />}
      renderItem={({ item }) => (
        <View style={{ padding: 10 }}>
          <Text>{item.title}</Text>
        </View>
      )}
    />
  );
};
```

### With Component Type

```tsx
const LoadingIndicator = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#0000ff" />
  </View>
);

<FlashList
  data={data}
  isLoading={isFetchingData}
  LoadingComponent={LoadingIndicator}  // Pass as component type
  renderItem={({ item }) => <ItemComponent item={item} />}
/>
```

### With Headers and Footers

```tsx
<FlashList
  data={data}
  isLoading={isLoading}
  LoadingComponent={<LoadingSkeleton />}
  ListHeaderComponent={<Header />}  // Still renders during loading
  ListFooterComponent={<Footer />}  // Still renders during loading
  renderItem={({ item }) => <ItemComponent item={item} />}
/>
```

### Priority Order

The component rendering follows this priority:
1. If `isLoading` is `true` → show `LoadingComponent`
2. Else if data is empty → show `ListEmptyComponent`
3. Else → show list items

```tsx
<FlashList
  data={data}
  isLoading={isLoading}
  LoadingComponent={<LoadingSkeleton />}
  ListEmptyComponent={<EmptyState />}
  renderItem={({ item }) => <ItemComponent item={item} />}
/>
```

## Benefits

1. **No Visual Glitches**: FlashList stays mounted, avoiding layout shifts
2. **Clean API**: Follows the same pattern as `ListEmptyComponent`, `ListHeaderComponent`, etc.
3. **Flexible**: Accepts both component types and React elements
4. **Compatible**: Works seamlessly with all existing FlashList features
5. **Type-Safe**: Full TypeScript support with proper type definitions

## API Reference

### Props

#### `LoadingComponent`
- **Type**: `React.ComponentType<any> | React.ReactElement | null | undefined`
- **Description**: Component to render when the list is in a loading state
- **Default**: `undefined`

#### `isLoading`
- **Type**: `boolean | null | undefined`
- **Description**: Boolean flag to control when the LoadingComponent is displayed
- **Default**: `undefined`

## Migration Guide

### Before (using ListEmptyComponent workaround)

```tsx
<FlashList
  data={isLoading ? [] : data}
  ListEmptyComponent={isLoading ? <LoadingSkeleton /> : <EmptyState />}
  renderItem={({ item }) => <ItemComponent item={item} />}
/>
```

### After (using LoadingComponent)

```tsx
<FlashList
  data={data}
  isLoading={isLoading}
  LoadingComponent={<LoadingSkeleton />}
  ListEmptyComponent={<EmptyState />}
  renderItem={({ item }) => <ItemComponent item={item} />}
/>
```

## Implementation Details

The feature is implemented in three main files:
1. **FlashListProps.ts**: Type definitions for the new props
2. **useSecondaryProps.tsx**: Logic to render the loading component
3. **RecyclerView.tsx**: Integration into the main rendering flow

The implementation ensures that:
- Loading component takes precedence over empty component
- Headers and footers continue to render during loading
- The feature works with both vertical and horizontal lists
- No breaking changes to existing functionality
