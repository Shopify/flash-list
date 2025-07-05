---
id: layout-commit-observer
title: Layout Commit Observer
---

# Layout Commit Observer

The `LayoutCommitObserver` is a utility component that helps you track when all FlashList components in your component tree have completed their initial layout. This is particularly useful for coordinating complex UI behaviors that depend on list rendering completion. Doing your own `setState` in this callback will block paint till your state change is ready to be committed.

## Overview

When working with multiple FlashList components or when you need to perform actions after a FlashList has finished its initial render, the LayoutCommitObserver provides a clean way to observe and react to these layout events.

## When to Use

- Measure size of views after all internal lists have rendered
- Don't have access to FlashList for example, your component just accepts `children` prop.

## When not to use

- If you don't need to block paint then using the `onLoad` callback is a better approach.
- If you only have one FlashList and have access to it. `onCommitLayoutEffect` is a prop on FlashList too.

## Basic Usage

Wrap your component tree containing FlashLists with LayoutCommitObserver:

```tsx
import { LayoutCommitObserver } from "@shopify/flash-list";

function MyScreen() {
  const handleLayoutComplete = () => {
    console.log("All FlashLists have completed their initial layout!");
    // Perform any post-layout actions here
  };

  return (
    <LayoutCommitObserver onCommitLayoutEffect={handleLayoutComplete}>
      <View>
        <FlashList
          data={data1}
          renderItem={renderItem1}
          estimatedItemSize={50}
        />
        <FlashList
          data={data2}
          renderItem={renderItem2}
          estimatedItemSize={100}
        />
      </View>
    </LayoutCommitObserver>
  );
}
```
