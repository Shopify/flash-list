---
id: known-issues
title: Known issues
slug: /known-issues
sidebar_position: 3
---

# Known Issues

FlashList and FlatList have very different internal. While the API is almost the same, the behaviour might be different in some cases due to a bug, limitation or missing implementation. In any case, if the issue is already listed here don't create a new one.

### 1) Horizontal lists + RTL Layout

We have a limitation where we're not able to read the padding applied on the list using `contentContainerStyle`. Small values shouldn't cause an issue; however, if you require precise `scrollTo` or `initialScrollIndex`, then apply padding or margin to the header instead. Please note that this applies only to RTL language layouts.
