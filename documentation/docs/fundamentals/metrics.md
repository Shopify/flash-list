---
id: metrics
title: Metrics
slug: /metrics
sidebar_position: 1
---

FlashList enables you to track metrics in production that can give you more insight into how your app is doing in terms of performance. We recommend that you track the following in production:

### Visible blank area

FlashList comes with a hook that can track cumulative and maximum blank space that the user experienced while scrolling the list. The cost of tracking this metric is minimal and you can implement it in the following way:

```tsx
const MyComponent = () => {
  // `any` is the type of data. You can mention the type of data that you're using with your FlashList implementation.
  const ref = useRef<FlashList<any>>(null);

  // The tracking will happen for the entire lifecycle of the list and the result object will always have the latest values.
  // You can make a call when to ingest this data. We recommend that you ingest when the list unmounts.
  const [blankAreaTrackerResult, onBlankArea] = useBlankAreaTracker(ref);
  useEffect(() => {
    return () => {
      // When component is being cleaned up, you can ingest the result into your analytics system.
      // blankAreaTrackerResult has two fields - `cumulativeBlankArea` and `maxBlankArea`. `cumulativeBlankArea` is the total blank area that the user has seen while scrolling the list.
      // maxBlankArea is the maximum blank area that the user has seen while scrolling the list.
      ingestData(blankAreaTrackerResult);
    };
  }, []);

  // pass the listener returned by the hook to FlashList
  return <FlashList {...props} ref={ref} onBlankArea={onBlankArea} />;
};
```

You can rest assured when you see close to zero blank space in production. If you're not happy with the numbers, please refer to our [performance troubleshooting guide](./performance-troubleshooting.md) which can help you optimize your list's performance.

### Load time

FlashList has a built in `onLoad` event that you can use to track the time taken to load the list. This tracks elapsed time from the point the list was created to the time when it's children are visible to the user.

```tsx
const MyComponent = () => {
    const onLoadListener = useCallback(({ elapsedTimeInMs } ) => {
        ingestData("Sample List load time", elapsedTimeInMs);
    }, []);
    return <FlashList {...props} onLoad={onLoadListener} />;
```

### Sampling

Please note that you can always sample data collected by your implementation. It's possible to get an accurate picture of how your app is performing by collecting data from a subset of users. This is important incase you want to limit how much data you collect.
