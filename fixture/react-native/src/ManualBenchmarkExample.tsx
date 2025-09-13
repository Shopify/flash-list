import React, { useRef, useState } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import { FlashList, FlashListRef, useBenchmark } from "@shopify/flash-list";

interface DataItem {
  id: string;
  title: string;
  value: number;
}

const generateData = (count: number): DataItem[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `item-${index}`,
    title: `Item ${index}`,
    value: Math.floor(Math.random() * 100),
  }));
};

const ManualBenchmarkExample = () => {
  const flashListRef = useRef<FlashListRef<DataItem>>(null);
  const [data] = useState(() => generateData(1000));
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
    marginBottom: 8,
  },
  item: {
    backgroundColor: "white",
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
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
  value: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  resultContainer: {
    padding: 16,
    backgroundColor: "#e8f5e9",
    borderTopWidth: 1,
    borderTopColor: "#4caf50",
  },
  resultText: {
    fontSize: 12,
    fontFamily: "monospace",
    color: "#2e7d32",
  },
});

export default ManualBenchmarkExample;
