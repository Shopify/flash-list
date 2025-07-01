import React, { useMemo, useState, useCallback } from "react";
import { Text, View, StyleSheet, Platform, Pressable } from "react-native";
import { FlashList, useRecyclingState } from "@shopify/flash-list";

interface DynamicItem {
  id: number;
  title: string;
  color: string;
  height: number;
  span: number;
}

const colors = [
  "#FF5252",
  "#FF4081",
  "#E040FB",
  "#7C4DFF",
  "#536DFE",
  "#448AFF",
  "#40C4FF",
  "#18FFFF",
  "#64FFDA",
  "#69F0AE",
  "#B2FF59",
  "#EEFF41",
  "#FFFF00",
  "#FFD740",
  "#FFAB40",
  "#FF6E40",
];

// Generate data with both height and span variations
const generateData = (count: number, spanPattern: number[]): DynamicItem[] => {
  const items: DynamicItem[] = [];
  for (let i = 0; i < count; i++) {
    items.push({
      id: i,
      title: `Item ${i}`,
      span: spanPattern[i % spanPattern.length],
      height: ((i * 15) % 120) + 80,
      color: colors[i % colors.length],
    });
  }
  return items;
};

// Helper function to compare arrays
const arraysEqual = (arr1: number[], arr2: number[]): boolean => {
  return (
    arr1.length === arr2.length &&
    arr1.every((val, index) => val === arr2[index])
  );
};

export function DynamicColumnSpan() {
  const [numItems] = useState(500);
  const [isMasonry, setIsMasonry] = useState(false);
  const [numColumns, setNumColumns] = useState(3);
  const [spanPattern, setSpanPattern] = useState([1, 1, 1]);

  // Predefined span patterns
  const spanPatterns = {
    uniform: [1, 1, 1],
    alternating: [1, 2, 1],
    mixed: [1, 1, 2, 1, 3, 1],
    large: [2, 2, 2],
    varied: [1, 2, 1, 3, 1, 2],
  };

  const data = useMemo(
    () => generateData(numItems, spanPattern),
    [numItems, spanPattern]
  );

  const contentContainerStyle = useMemo(
    () => ({
      padding: 4,
    }),
    []
  );

  const overrideItemLayout = useCallback(
    (layout: { span: number; size?: number }, item: DynamicItem) => {
      layout.span = item.span;
      if (isMasonry) {
        layout.size = item.height;
      }
    },
    [isMasonry]
  );

  const renderItem = useCallback(
    ({ item }: { item: DynamicItem }) => {
      return <DynamicGridItem item={item} isMasonry={isMasonry} />;
    },
    [isMasonry]
  );

  const keyExtractor = useCallback(
    (item: DynamicItem) => item.id.toString(),
    []
  );

  const toggleLayout = () => {
    setIsMasonry(!isMasonry);
  };

  const changeColumns = (cols: number) => {
    setNumColumns(cols);
  };

  const changeSpanPattern = (patternKey: keyof typeof spanPatterns) => {
    setSpanPattern(spanPatterns[patternKey]);
  };

  return (
    <React.StrictMode>
      <View style={styles.container}>
        {/* Control Panel */}
        <View style={styles.controlPanel}>
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Layout:</Text>
            <Pressable
              style={[styles.controlButton, !isMasonry && styles.activeButton]}
              onPress={toggleLayout}
            >
              <Text
                style={[
                  styles.buttonText,
                  !isMasonry && styles.activeButtonText,
                ]}
              >
                {isMasonry ? "Switch to Grid" : "Grid Mode"}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.controlButton, isMasonry && styles.activeButton]}
              onPress={toggleLayout}
            >
              <Text
                style={[
                  styles.buttonText,
                  isMasonry && styles.activeButtonText,
                ]}
              >
                {isMasonry ? "Masonry Mode" : "Switch to Masonry"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Columns:</Text>
            {[2, 3, 4].map((cols) => (
              <Pressable
                key={cols}
                style={[
                  styles.controlButton,
                  numColumns === cols && styles.activeButton,
                ]}
                onPress={() => changeColumns(cols)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    numColumns === cols && styles.activeButtonText,
                  ]}
                >
                  {cols}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Span Pattern:</Text>
            <View style={styles.patternButtons}>
              {Object.keys(spanPatterns).map((patternKey) => (
                <Pressable
                  key={patternKey}
                  style={[
                    styles.controlButton,
                    styles.patternButton,
                    arraysEqual(
                      spanPattern,
                      spanPatterns[patternKey as keyof typeof spanPatterns]
                    ) && styles.activeButton,
                  ]}
                  onPress={() =>
                    changeSpanPattern(patternKey as keyof typeof spanPatterns)
                  }
                >
                  <Text
                    style={[
                      styles.buttonText,
                      styles.patternButtonText,
                      arraysEqual(
                        spanPattern,
                        spanPatterns[patternKey as keyof typeof spanPatterns]
                      ) && styles.activeButtonText,
                    ]}
                  >
                    {patternKey}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* List */}
        <FlashList
          testID="DynamicColumnSpanList"
          data={data}
          numColumns={numColumns}
          masonry={isMasonry}
          contentContainerStyle={contentContainerStyle}
          overrideItemLayout={overrideItemLayout}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
        />
      </View>
    </React.StrictMode>
  );
}

const DynamicGridItem = ({
  item,
  isMasonry,
}: {
  item: DynamicItem;
  isMasonry: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useRecyclingState(false, [item.id]);

  // For grid mode, use dynamic height based on expansion
  // For masonry mode, use the predefined height
  const baseHeight = isMasonry ? item.height : 60;
  const height = isMasonry
    ? item.height
    : isExpanded
    ? baseHeight + 40
    : baseHeight;

  return (
    <Pressable
      onPress={() => !isMasonry && setIsExpanded(!isExpanded)}
      style={styles.itemPressable}
    >
      <View
        style={[
          styles.itemWrapper,
          {
            backgroundColor: item.color,
            height,
          },
        ]}
      >
        <View style={styles.itemContent}>
          <Text style={styles.itemText}>{item.title}</Text>
          <Text style={styles.spanText}>Span: {item.span}</Text>
          {isMasonry && (
            <Text style={styles.heightText}>Height: {item.height}</Text>
          )}
          {!isMasonry && (
            <Text style={styles.expandText}>
              {isExpanded ? "Tap to collapse" : "Tap to expand"}
            </Text>
          )}
        </View>
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
  controlPanel: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap",
  },
  controlLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 12,
    minWidth: 80,
    color: "#333",
  },
  controlButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 4,
  },
  patternButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  patternButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 1,
  },
  activeButton: {
    backgroundColor: "#007AFF",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  patternButtonText: {
    fontSize: 12,
    textTransform: "capitalize",
  },
  activeButtonText: {
    color: "#fff",
  },
  itemPressable: {
    flex: 1,
  },
  itemWrapper: {
    margin: 4,
    borderRadius: 8,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  itemContent: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  itemText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 4,
  },
  spanText: {
    color: "#fff",
    fontSize: 12,
    opacity: 0.9,
    marginBottom: 2,
  },
  heightText: {
    color: "#fff",
    fontSize: 10,
    opacity: 0.8,
  },
  expandText: {
    color: "#fff",
    fontSize: 10,
    opacity: 0.8,
    textAlign: "center",
  },
});
