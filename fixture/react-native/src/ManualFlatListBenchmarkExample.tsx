import React, { useRef, useState } from "react";
import { View, Text, Button, StyleSheet, Alert, FlatList } from "react-native";
import { useFlatListBenchmark } from "@shopify/flash-list";

interface DataItem {
  id: string;
  title: string;
  description: string;
}

const generateData = (count: number): DataItem[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `item-${index}`,
    title: `Item ${index}`,
    description: `This is a description for item ${index}. It contains some text to make the item larger.`,
  }));
};

const ManualFlatListBenchmarkExample = () => {
  const flatListRef = useRef<FlatList<DataItem>>(null);
  const [data] = useState(() => generateData(500));
  const [benchmarkResult, setBenchmarkResult] = useState<string>("");

  const { startBenchmark, isBenchmarkRunning } = useFlatListBenchmark(
    flatListRef as any,
    (result) => {
      if (!result.interrupted) {
        setBenchmarkResult(result.formattedString || "No results");
        Alert.alert("FlatList Benchmark Complete", result.formattedString);
      }
    },
    {
      startManually: true,
      targetOffset: 100000,
      repeatCount: 2,
      speedMultiplier: 2,
    }
  );

  const renderItem = ({ item }: { item: DataItem }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Manual FlatList Benchmark Example</Text>
        <Text style={styles.subheader}>
          Tests native FlatList performance for comparison
        </Text>
        <Button
          title={isBenchmarkRunning ? "Running..." : "Start FlatList Benchmark"}
          onPress={startBenchmark}
          disabled={isBenchmarkRunning}
        />
      </View>

      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        getItemLayout={(_, index) => ({
          length: 100,
          offset: 100 * index,
          index,
        })}
      />

      {benchmarkResult ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>FlatList Results:</Text>
          <Text style={styles.resultText}>{benchmarkResult}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subheader: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  item: {
    backgroundColor: "white",
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    height: 84, // Fixed height for consistent scrolling
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  resultContainer: {
    padding: 16,
    backgroundColor: "#fff3e0",
    borderTopWidth: 1,
    borderTopColor: "#ff9800",
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#e65100",
  },
  resultText: {
    fontSize: 12,
    fontFamily: "monospace",
    color: "#bf360c",
  },
});

export default ManualFlatListBenchmarkExample;
