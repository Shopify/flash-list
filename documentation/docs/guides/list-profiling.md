# List Profiling with useBenchmark

The `useBenchmark` hook provides a comprehensive way to measure and analyze the performance of your FlashList implementation. It automatically scrolls through your list while collecting performance metrics and provides actionable suggestions for optimization.

## Basic Usage

```tsx
import { useRef } from "react";
import { FlashList, FlashListRef, useBenchmark } from "@shopify/flash-list";

function MyList() {
  const flashListRef = useRef<FlashListRef<MyDataType>>(null);

  // Basic benchmark setup
  useBenchmark(flashListRef, (result) => {
    console.log("Benchmark complete:", result.formattedString);
  });

  return <FlashList ref={flashListRef} data={data} renderItem={renderItem} />;
}
```

## Manual Benchmark Control

For more control over when the benchmark runs, use the `startManually` option:

```tsx
const { startBenchmark, isBenchmarkRunning } = useBenchmark(
  flashListRef,
  (result) => {
    if (!result.interrupted) {
      Alert.alert("Benchmark Complete", result.formattedString);
    }
  },
  {
    startManually: true,
    repeatCount: 3,
    speedMultiplier: 1.5,
  }
);

// Trigger benchmark on button press
<Button
  title={isBenchmarkRunning ? "Running..." : "Start Benchmark"}
  onPress={startBenchmark}
  disabled={isBenchmarkRunning}
/>;
```

## Configuration Options

The `useBenchmark` hook accepts an optional `BenchmarkParams` object:

| Parameter         | Type    | Default | Description                                                             |
| ----------------- | ------- | ------- | ----------------------------------------------------------------------- |
| `startDelayInMs`  | number  | 3000    | Delay before automatic benchmark start (in milliseconds)                |
| `speedMultiplier` | number  | 1       | Multiplier for scroll speed (higher = faster scrolling)                 |
| `repeatCount`     | number  | 1       | Number of times to repeat the benchmark                                 |
| `startManually`   | boolean | false   | Prevent automatic start, use returned `startBenchmark` function instead |

## Understanding Results

The benchmark returns a `BenchmarkResult` object containing:

```typescript
interface BenchmarkResult {
  js?: {
    averageFPS: number;
    minFPS: number;
    maxFPS: number;
  };
  interrupted: boolean;
  suggestions: string[];
  formattedString?: string;
}
```

### Key Metrics

- **Average FPS**: The average JavaScript frames per second during scrolling
- **Min FPS**: The lowest FPS recorded
- **Max FPS**: The highest FPS recorded

### Interpreting Results

- **Good Performance**: Average FPS above 50
- **Acceptable Performance**: Average FPS between 35-50
- **Poor Performance**: Average FPS below 35

## Performance Suggestions

The benchmark automatically provides suggestions based on your results:

1. **Low JS FPS** (< 35 FPS): Indicates components are doing too much work. Consider:

   - Optimizing render methods
   - Reducing component complexity
   - Implementing memoization
   - Minimizing re-renders

2. **Small Dataset** (< 200 items): Testing with larger datasets provides more realistic performance metrics

## Example

```tsx
const generateData = (count: number): DataItem[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `item-${index}`,
    title: `Item ${index}`,
    value: Math.floor(Math.random() * 100),
  }));
};

const ManualBenchmarkExample = () => {
  const flashListRef = useRef<FlashListRef<DataItem>>(null);
  const [data] = useState(() => generateData(500));
  const [benchmarkResult, setBenchmarkResult] = useState<string>("");

  const { startBenchmark, isBenchmarkRunning } = useBenchmark(
    flashListRef,
    (result) => {
      if (!result.interrupted) {
        setBenchmarkResult(result.formattedString || "No results");
        Alert.alert("Benchmark Complete", result.formattedString);
      }
    },
    {
      startManually: true,
      repeatCount: 3,
      speedMultiplier: 1.5,
    }
  );

  const renderItem = ({ item }: { item: DataItem }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.value}>Value: {item.value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Manual Benchmark Example</Text>
        <Button
          title={isBenchmarkRunning ? "Running..." : "Start Benchmark"}
          onPress={startBenchmark}
          disabled={isBenchmarkRunning}
        />
      </View>

      <FlashList
        ref={flashListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />

      {benchmarkResult ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>{benchmarkResult}</Text>
        </View>
      ) : null}
    </View>
  );
};
```

## Best Practices

1. **Test with Production Data**: Use realistic data sizes and complexity
2. **Run Multiple Iterations**: Use `repeatCount` for more accurate averages
3. **Test on Target Devices**: Performance varies significantly across devices
4. **Benchmark Before and After**: Compare results when making optimizations
5. **Consider User Scenarios**: Test with different scroll speeds using `speedMultiplier`
