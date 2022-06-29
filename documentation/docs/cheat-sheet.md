---
id: cheat-sheet
title: Cheat sheet
slug: /cheat-sheet
sidebar_position: 4
---

Follow the instructions here to quickly migrate to FlashList without running into common problems. This list is based on our own experiences while migrating to FlashList.

1. Switch from FlatList to FlashList and render the list once. You should see a warning about missing `estimatedItemSize` and a suggestion. Set this value as the prop directly.
2. Scan your `renderItem` hierarchy for explicit `key` prop definitions and remove them. If you’re doing a `.map()` use indices as keys. This is VERY important.
3. If your list has heterogenous views, pass their types to FlashList using `getItemType` prop. This will improve recycling.
4. Do not test perf with JS dev mode on. Make sure you’re in release mode. FlashList can appear slower while in dev due to a small render buffer.

Read more [here](./fundamentals/performant-components.md)
