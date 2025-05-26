import React, { forwardRef, ForwardedRef, useState, useCallback } from "react";
import {
  Text,
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { FlashListRef, RecyclerView } from "@shopify/flash-list";
import FastImage from "@d11/react-native-fast-image";

// Define our data structure
interface MasonryItem {
  id: string;
  title: string;
  image: string;
  height: number;
  span: number; // Number of columns this item should span
  color: string;
  isExpanded: boolean; // Track if the item is expanded
}

// Generate a visually appealing color palette
const COLORS = [
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

// Sample image URLs (using placeholder images)
const IMAGE_URLS = [
  "https://images.unsplash.com/photo-1501594907352-04cda38ebc29",
  "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f",
  "https://images.unsplash.com/photo-1551085254-e96b210db58a",
  "https://images.unsplash.com/photo-1487700160041-babef9c3cb55",
  "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e",
  "https://images.unsplash.com/photo-1484723091739-30a097e8f929",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
  "https://images.unsplash.com/photo-1565958011703-44f9829ba187",
  "https://images.unsplash.com/photo-1482049016688-2d3e1b311543",
];

// Generate random data for our masonry layout
const generateMasonryData = (count: number, startIndex = 0): MasonryItem[] => {
  return Array.from({ length: count }, (_, index) => {
    // Create a pattern of spans to make it visually interesting
    // Items with span=2 will take up 2 columns
    const actualIndex = startIndex + index;
    let span = 1;
    if (actualIndex === 0 || actualIndex === 7) {
      span = 2;
    }

    // Vary the heights to create visual interest
    // Items with span=2 should generally be shorter to create a balanced layout
    const baseHeight = span === 2 ? 180 : 220;
    const heightVariation = span === 2 ? 40 : 80;
    const height = baseHeight + (actualIndex % 3) * heightVariation;

    return {
      id: actualIndex.toString(),
      title: `Item ${actualIndex}`,
      image: IMAGE_URLS[actualIndex % IMAGE_URLS.length],
      height,
      span,
      color: COLORS[actualIndex % COLORS.length],
      isExpanded: false, // Initially not expanded
    };
  });
};

// Card component for each masonry item
const MasonryCard = ({
  item,
  onToggleExpand,
}: {
  item: MasonryItem;
  onToggleExpand: (id: string) => void;
}) => {
  // Calculate the current height based on expansion state
  const currentHeight = item.isExpanded
    ? item.height * 1.5 // Increase height by 50% when expanded
    : item.height;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onToggleExpand(item.id)}
    >
      <View
        style={[
          styles.card,
          {
            height: currentHeight,
            backgroundColor: item.color,
          },
        ]}
      >
        <FastImage
          source={{ uri: `${item.image}` }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.overlay}>
          <Text style={styles.title}>{item.title}</Text>
          {item.span > 1 && (
            <Text style={styles.spanLabel}>Span: {item.span}</Text>
          )}
          <Text style={styles.expandedLabel}>
            {item.isExpanded ? "Tap to shrink" : "Tap to expand"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Create our masonry component
const ComplexMasonryComponent = (_: unknown, ref: ForwardedRef<unknown>) => {
  const columnCount = 3;
  const [items, setItems] = useState(() => generateMasonryData(50));
  const [isLoading, setIsLoading] = useState(false);

  // Handle toggling the expanded state of an item
  const handleToggleExpand = useCallback((id: string) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, isExpanded: !item.isExpanded } : item
      )
    );
  }, []);

  // Handle loading more items when reaching the end of the list
  const handleEndReached = useCallback(() => {
    if (isLoading) return;

    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      setItems((currentItems) => [
        ...currentItems,
        ...generateMasonryData(20, currentItems.length),
      ]);
      setIsLoading(false);
    }, 500);
  }, [isLoading]);

  // Footer component with loading indicator
  const renderFooter = useCallback(() => {
    if (!isLoading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }, [isLoading]);

  // Memoize the renderItem function
  const renderItem = useCallback(
    ({ item }: { item: MasonryItem }) => (
      <MasonryCard item={item} onToggleExpand={handleToggleExpand} />
    ),
    [handleToggleExpand]
  );

  return (
    <View style={styles.container}>
      <RecyclerView
        ref={ref as React.RefObject<FlashListRef<MasonryItem>>}
        testID="ComplexMasonryList"
        data={items}
        masonry
        optimizeItemArrangement
        numColumns={columnCount}
        estimatedItemSize={200}
        overrideItemLayout={(layout: any, item: MasonryItem) => {
          // Set the height based on the item's height property and expansion state
          layout.size = item.isExpanded ? item.height * 1.5 : item.height;
          // Set the span based on the item's span property
          layout.span = item.span;
        }}
        keyExtractor={(item: MasonryItem) => item.id}
        renderItem={renderItem}
        ListFooterComponent={renderFooter}
        onEndReached={handleEndReached}
        onEndReachedThreshold={1}
        contentContainerStyle={styles.listContent}
        viewabilityConfig={{
          minimumViewTime: 1000,
          itemVisiblePercentThreshold: 0,
        }}
        onViewableItemsChanged={({ changed }) => {
          console.log("viewableItems", changed);
        }}
      />
    </View>
  );
};

// Export with forwardRef to handle the ref properly
export const ComplexMasonry = forwardRef(ComplexMasonryComponent);

const styles = StyleSheet.create({
  container: {
    flex: Platform.OS === "web" ? undefined : 1,
    height: Platform.OS === "web" ? window.innerHeight : undefined,
    backgroundColor: "#f5f5f5",
  },
  listContent: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  card: {
    margin: 4,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 12,
    justifyContent: "flex-end",
  },
  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  spanLabel: {
    color: "white",
    fontSize: 12,
    marginTop: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  expandedLabel: {
    color: "white",
    fontSize: 10,
    marginTop: 4,
    opacity: 0.8,
  },
  footer: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
