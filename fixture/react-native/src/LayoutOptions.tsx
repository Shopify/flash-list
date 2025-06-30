import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Pressable,
  Switch,
  ScrollView,
} from "react-native";
import { FlashList, useRecyclingState } from "@shopify/flash-list";

interface ListItem {
  id: number;
  title: string;
  color: string;
  height: number;
}

// Generate colors for the items
const colors = [
  "#FF5252", // Red
  "#FF4081", // Pink
  "#E040FB", // Purple
  "#7C4DFF", // Deep Purple
  "#536DFE", // Indigo
  "#448AFF", // Blue
  "#40C4FF", // Light Blue
  "#18FFFF", // Cyan
  "#64FFDA", // Teal
  "#69F0AE", // Green
  "#B2FF59", // Light Green
  "#EEFF41", // Lime
  "#FFFF00", // Yellow
  "#FFD740", // Amber
  "#FFAB40", // Orange
  "#FF6E40", // Deep Orange
];

export function LayoutOptions() {
  // Configuration states
  const [numColumns, setNumColumns] = useState(1);
  const [isHorizontal, setIsHorizontal] = useState(false);
  const [isMasonry, setIsMasonry] = useState(false);
  const [optimizeItemArrangement, setOptimizeItemArrangement] = useState(false);

  // Generate data
  const data: ListItem[] = useMemo(() => {
    return Array.from({ length: 100 }, (_, i) => ({
      id: i,
      title: `Item ${i}`,
      color: colors[i % colors.length],
      height: ((i * 10) % 100) + 100,
    }));
  }, []);

  // Configuration controls
  const renderControls = () => (
    <View style={styles.controls}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <ControlItem
          label={`Columns: ${numColumns}`}
          onPress={() => setNumColumns((prev) => (prev >= 4 ? 1 : prev + 1))}
        />
        <ControlItem
          label={`Orientation: ${isHorizontal ? "Horizontal" : "Vertical"}`}
          onPress={() => setIsHorizontal((prev) => !prev)}
        />
        <ControlItem
          label={`Layout: ${isMasonry ? "Masonry" : "Grid"}`}
          onPress={() => setIsMasonry((prev) => !prev)}
        />
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Optimize Arrangement:</Text>
          <Switch
            value={optimizeItemArrangement}
            onValueChange={setOptimizeItemArrangement}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={optimizeItemArrangement ? "#4472C4" : "#f4f3f4"}
          />
        </View>
      </ScrollView>
    </View>
  );

  const renderItem = useCallback(({ item }: { item: ListItem }) => {
    return <ListItemComponent item={item} />;
  }, []);

  return (
    <View style={styles.container}>
      {renderControls()}

      <FlashList
        data={data}
        numColumns={isHorizontal ? 1 : numColumns}
        horizontal={isHorizontal}
        masonry={!isHorizontal && isMasonry}
        optimizeItemArrangement={optimizeItemArrangement}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 4 }}
        renderItem={renderItem}
      />
    </View>
  );
}

// Component for control buttons
const ControlItem = ({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) => (
  <Pressable style={styles.controlButton} onPress={onPress}>
    <Text style={styles.controlButtonText}>{label}</Text>
  </Pressable>
);

// List item component
const ListItemComponent = ({ item }: { item: ListItem }) => {
  const [isExpanded, setIsExpanded] = useRecyclingState(false, [item.id]);

  return (
    <Pressable
      onPress={() => setIsExpanded(!isExpanded)}
      style={[
        styles.itemContainer,
        {
          backgroundColor: item.color,
        },
      ]}
    >
      <View
        style={[
          {
            height: isExpanded ? item.height : 120,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <Text style={styles.itemText}>{item.title}</Text>
        {isExpanded && <Text style={styles.expandedText}>Tap to collapse</Text>}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: Platform.OS === "web" ? undefined : 1,
    height: Platform.OS === "web" ? window.innerHeight : undefined,
    backgroundColor: "#f5f5f5",
  },
  controls: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  controlButton: {
    backgroundColor: "#4472C4",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
    minWidth: 120,
    alignItems: "center",
  },
  controlButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  switchLabel: {
    marginRight: 8,
    fontSize: 13,
  },
  itemContainer: {
    flex: 1,
    margin: 4,
    padding: 16,
    borderRadius: 8,
  },
  itemText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  expandedText: {
    color: "#ffffff",
    marginTop: 8,
    opacity: 0.8,
  },
});
