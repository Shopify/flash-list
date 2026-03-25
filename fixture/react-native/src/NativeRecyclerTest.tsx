/**
 * NativeRecyclerTest - Comprehensive test screen for native-backed recycling.
 *
 * Tests all FlashList props and behaviors with the native RecyclerView backend.
 * Each section can be navigated independently to test specific features.
 */
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { NativeFlashListView } from "@shopify/flash-list";
import type { FlashListRef } from "@shopify/flash-list";

// ========== Test Data Generators ==========

function generateItems(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    title: `Item ${i}`,
    subtitle: `Description for item ${i}`,
    height: 60 + (i % 5) * 20, // Variable heights: 60, 80, 100, 120, 140
    type: i % 3 === 0 ? "featured" : i % 2 === 0 ? "compact" : "standard",
    color: `hsl(${(i * 37) % 360}, 70%, 85%)`,
  }));
}

interface TestItem {
  id: string;
  title: string;
  subtitle: string;
  height: number;
  type: string;
  color: string;
}

// ========== Basic List Test ==========

export function BasicListTest() {
  const data = useMemo(() => generateItems(200), []);
  const NativeComp = require("@shopify/flash-list/dist/native/NativeFlashListViewNativeComponent").default;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Basic List (200 items)</Text>
      <NativeComp style={{ flex: 1 }}>
        {data.slice(0, 20).map((item: TestItem, i: number) => (
          <View key={item.id} style={[styles.item, { backgroundColor: item.color, height: item.height }]}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
          </View>
        ))}
      </NativeComp>
    </View>
  );
}

// ========== Grid Test ==========

export function GridTest() {
  const data = useMemo(() => generateItems(100), []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Grid Layout (3 columns)</Text>
      <NativeFlashListView
        data={data}
        numColumns={3}
        renderItem={({ item }: { item: TestItem }) => (
          <View style={[styles.gridItem, { backgroundColor: item.color }]}>
            <Text style={styles.gridItemText}>{item.title}</Text>
          </View>
        )}
        keyExtractor={(item: TestItem) => item.id}
      />
    </View>
  );
}

// ========== Masonry Test ==========

export function MasonryTest() {
  const data = useMemo(() => generateItems(100), []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Masonry Layout</Text>
      <NativeFlashListView
        data={data}
        masonry
        numColumns={2}
        renderItem={({ item }: { item: TestItem }) => (
          <View
            style={[
              styles.masonryItem,
              { backgroundColor: item.color, height: item.height + 40 },
            ]}
          >
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemSubtitle}>H: {item.height + 40}</Text>
          </View>
        )}
        keyExtractor={(item: TestItem) => item.id}
      />
    </View>
  );
}

// ========== Horizontal List Test ==========

export function HorizontalListTest() {
  const data = useMemo(() => generateItems(50), []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Horizontal List</Text>
      <NativeFlashListView
        data={data}
        horizontal
        renderItem={({ item }: { item: TestItem }) => (
          <View style={[styles.horizontalItem, { backgroundColor: item.color }]}>
            <Text style={styles.itemTitle}>{item.title}</Text>
          </View>
        )}
        keyExtractor={(item: TestItem) => item.id}
      />
    </View>
  );
}

// ========== Inverted List Test ==========

export function InvertedListTest() {
  const data = useMemo(() => generateItems(50), []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Inverted List</Text>
      <NativeFlashListView
        data={data}
        inverted
        renderItem={({ item }: { item: TestItem }) => (
          <View style={[styles.item, { backgroundColor: item.color, height: 60 }]}>
            <Text style={styles.itemTitle}>{item.title}</Text>
          </View>
        )}
        keyExtractor={(item: TestItem) => item.id}
      />
    </View>
  );
}

// ========== Imperative Methods Test ==========

export function ImperativeMethodsTest() {
  const data = useMemo(() => generateItems(200), []);
  const listRef = useRef<FlashListRef<TestItem>>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Imperative Methods</Text>
      <View style={styles.buttonRow}>
        <Pressable
          style={styles.button}
          onPress={() => listRef.current?.scrollToIndex({ index: 50, animated: true })}
        >
          <Text style={styles.buttonText}>Index 50</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => listRef.current?.scrollToIndex({ index: 100, animated: true, viewPosition: 0.5 })}
        >
          <Text style={styles.buttonText}>Index 100 (center)</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => listRef.current?.scrollToEnd({ animated: true })}
        >
          <Text style={styles.buttonText}>End</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => listRef.current?.scrollToTop({ animated: true })}
        >
          <Text style={styles.buttonText}>Top</Text>
        </Pressable>
      </View>
      <NativeFlashListView
        ref={listRef}
        data={data}
        renderItem={({ item, index }: { item: TestItem; index: number }) => (
          <View style={[styles.item, { backgroundColor: item.color, height: 60 }]}>
            <Text style={styles.itemTitle}>#{index} - {item.title}</Text>
          </View>
        )}
        keyExtractor={(item: TestItem) => item.id}
      />
    </View>
  );
}

// ========== End/Start Reached Test ==========

export function EndReachedTest() {
  const [data, setData] = useState(() => generateItems(20));
  const [loading, setLoading] = useState(false);
  const [startCount, setStartCount] = useState(0);
  const [endCount, setEndCount] = useState(0);

  const handleEndReached = useCallback(() => {
    if (loading) return;
    setLoading(true);
    setEndCount((c) => c + 1);
    setTimeout(() => {
      setData((prev) => [
        ...prev,
        ...generateItems(10).map((item, i) => ({
          ...item,
          id: `item-${prev.length + i}`,
          title: `Item ${prev.length + i}`,
        })),
      ]);
      setLoading(false);
    }, 500);
  }, [loading]);

  const handleStartReached = useCallback(() => {
    setStartCount((c) => c + 1);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        End/Start Reached (items: {data.length}, end: {endCount}, start: {startCount})
      </Text>
      <NativeFlashListView
        data={data}
        renderItem={({ item, index }: { item: TestItem; index: number }) => (
          <View style={[styles.item, { backgroundColor: item.color, height: 60 }]}>
            <Text style={styles.itemTitle}>#{index} - {item.title}</Text>
          </View>
        )}
        keyExtractor={(item: TestItem) => item.id}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        onStartReached={handleStartReached}
        onStartReachedThreshold={0.2}
      />
      {loading && (
        <View style={styles.loadingBar}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}
    </View>
  );
}

// ========== Refresh Control Test ==========

export function RefreshControlTest() {
  const [data, setData] = useState(() => generateItems(30));
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setData(generateItems(30));
      setRefreshing(false);
    }, 1500);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Pull to Refresh</Text>
      <NativeFlashListView
        data={data}
        renderItem={({ item }: { item: TestItem }) => (
          <View style={[styles.item, { backgroundColor: item.color, height: 60 }]}>
            <Text style={styles.itemTitle}>{item.title}</Text>
          </View>
        )}
        keyExtractor={(item: TestItem) => item.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
}

// ========== Empty List Test ==========

export function EmptyListTest() {
  const [data, setData] = useState<TestItem[]>([]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Empty / Single Item</Text>
      <View style={styles.buttonRow}>
        <Pressable style={styles.button} onPress={() => setData([])}>
          <Text style={styles.buttonText}>Empty</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => setData(generateItems(1))}
        >
          <Text style={styles.buttonText}>1 Item</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => setData(generateItems(100))}
        >
          <Text style={styles.buttonText}>100 Items</Text>
        </Pressable>
      </View>
      <NativeFlashListView
        data={data}
        renderItem={({ item }: { item: TestItem }) => (
          <View style={[styles.item, { backgroundColor: item.color, height: 60 }]}>
            <Text style={styles.itemTitle}>{item.title}</Text>
          </View>
        )}
        keyExtractor={(item: TestItem) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items to display</Text>
          </View>
        }
      />
    </View>
  );
}

// ========== Dynamic Data Test ==========

export function DynamicDataTest() {
  const [data, setData] = useState(() => generateItems(20));
  const [counter, setCounter] = useState(20);

  const addItems = () => {
    const newItems = generateItems(5).map((item, i) => ({
      ...item,
      id: `item-${counter + i}`,
      title: `New Item ${counter + i}`,
    }));
    setData((prev) => [...prev, ...newItems]);
    setCounter((c) => c + 5);
  };

  const removeFirst = () => {
    setData((prev) => prev.slice(1));
  };

  const removeLast = () => {
    setData((prev) => prev.slice(0, -1));
  };

  const shuffle = () => {
    setData((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Dynamic Data ({data.length} items)</Text>
      <View style={styles.buttonRow}>
        <Pressable style={styles.button} onPress={addItems}>
          <Text style={styles.buttonText}>Add 5</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={removeFirst}>
          <Text style={styles.buttonText}>Remove First</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={removeLast}>
          <Text style={styles.buttonText}>Remove Last</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={shuffle}>
          <Text style={styles.buttonText}>Shuffle</Text>
        </Pressable>
      </View>
      <NativeFlashListView
        data={data}
        renderItem={({ item }: { item: TestItem }) => (
          <View style={[styles.item, { backgroundColor: item.color, height: 60 }]}>
            <Text style={styles.itemTitle}>{item.title}</Text>
          </View>
        )}
        keyExtractor={(item: TestItem) => item.id}
      />
    </View>
  );
}

// ========== Large Dataset Performance Test ==========

export function PerformanceTest() {
  const data = useMemo(() => generateItems(10000), []);
  const [scrollInfo, setScrollInfo] = useState("Scroll to test");

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Performance (10,000 items)</Text>
      <Text style={styles.info}>{scrollInfo}</Text>
      <NativeFlashListView
        data={data}
        renderItem={({ item, index }: { item: TestItem; index: number }) => (
          <View style={[styles.item, { backgroundColor: item.color, height: 60 }]}>
            <Text style={styles.itemTitle}>#{index} - {item.title}</Text>
          </View>
        )}
        keyExtractor={(item: TestItem) => item.id}
        onScroll={(event: any) => {
          const offset = event?.nativeEvent?.contentOffset ?? 0;
          setScrollInfo(`Offset: ${Math.round(offset)}`);
        }}
      />
    </View>
  );
}

// ========== Item Types / Recycling Test ==========

export function ItemTypesTest() {
  const data = useMemo(() => generateItems(200), []);

  const getItemType = useCallback((item: TestItem) => item.type, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Item Types (3 types, recycled by type)</Text>
      <NativeFlashListView
        data={data}
        getItemType={getItemType}
        renderItem={({ item }: { item: TestItem }) => {
          if (item.type === "featured") {
            return (
              <View style={[styles.featuredItem, { backgroundColor: item.color }]}>
                <Text style={styles.featuredTitle}>{item.title}</Text>
                <Text style={styles.featuredSubtitle}>FEATURED</Text>
                <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
              </View>
            );
          }
          if (item.type === "compact") {
            return (
              <View style={[styles.compactItem, { backgroundColor: item.color }]}>
                <Text style={styles.compactText}>{item.title}</Text>
              </View>
            );
          }
          return (
            <View style={[styles.item, { backgroundColor: item.color, height: 60 }]}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
            </View>
          );
        }}
        keyExtractor={(item: TestItem) => item.id}
      />
    </View>
  );
}

// ========== Header/Footer Test ==========

export function HeaderFooterTest() {
  const data = useMemo(() => generateItems(30), []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Header / Footer / Separator</Text>
      <NativeFlashListView
        data={data}
        renderItem={({ item }: { item: TestItem }) => (
          <View style={[styles.item, { backgroundColor: item.color, height: 60 }]}>
            <Text style={styles.itemTitle}>{item.title}</Text>
          </View>
        )}
        keyExtractor={(item: TestItem) => item.id}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.listHeaderText}>List Header</Text>
          </View>
        }
        ListFooterComponent={
          <View style={styles.listFooter}>
            <Text style={styles.listFooterText}>List Footer</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

// ========== Viewability Test ==========

export function ViewabilityTest() {
  const data = useMemo(() => generateItems(100), []);
  const [viewableItems, setViewableItems] = useState<number[]>([]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Viewability Tracking</Text>
      <Text style={styles.info}>
        Viewable: [{viewableItems.join(", ")}]
      </Text>
      <NativeFlashListView
        data={data}
        renderItem={({ item, index }: { item: TestItem; index: number }) => (
          <View
            style={[
              styles.item,
              {
                backgroundColor: viewableItems.includes(index)
                  ? "#4CAF50"
                  : item.color,
                height: 80,
              },
            ]}
          >
            <Text style={styles.itemTitle}>
              #{index} {viewableItems.includes(index) ? "(VISIBLE)" : ""}
            </Text>
          </View>
        )}
        keyExtractor={(item: TestItem) => item.id}
        onViewableItemsChanged={(info: any) => {
          const indices = (info?.viewableItems ?? [])
            .filter((v: any) => v.isViewable)
            .map((v: any) => v.index);
          setViewableItems(indices);
        }}
      />
    </View>
  );
}

// ========== Span / Column Span Test ==========

export function SpanTest() {
  const data = useMemo(() => generateItems(50), []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Column Span (every 5th spans full width)</Text>
      <NativeFlashListView
        data={data}
        numColumns={3}
        overrideItemLayout={(layout, _item, index) => {
          if (index % 5 === 0) {
            layout.span = 3;
          }
        }}
        renderItem={({ item, index }: { item: TestItem; index: number }) => (
          <View
            style={[
              styles.gridItem,
              {
                backgroundColor: index % 5 === 0 ? "#FFD700" : item.color,
                height: index % 5 === 0 ? 80 : 60,
              },
            ]}
          >
            <Text style={styles.gridItemText}>
              #{index} {index % 5 === 0 ? "(FULL)" : ""}
            </Text>
          </View>
        )}
        keyExtractor={(item: TestItem) => item.id}
      />
    </View>
  );
}

// ========== Main Test Menu ==========

interface TestCase {
  title: string;
  component: React.ComponentType;
}

const testCases: TestCase[] = [
  { title: "Basic List", component: BasicListTest },
  { title: "Grid Layout", component: GridTest },
  { title: "Masonry Layout", component: MasonryTest },
  { title: "Horizontal List", component: HorizontalListTest },
  { title: "Inverted List", component: InvertedListTest },
  { title: "Imperative Methods", component: ImperativeMethodsTest },
  { title: "End/Start Reached", component: EndReachedTest },
  { title: "Refresh Control", component: RefreshControlTest },
  { title: "Empty/Single Item", component: EmptyListTest },
  { title: "Dynamic Data", component: DynamicDataTest },
  { title: "Performance (10K)", component: PerformanceTest },
  { title: "Item Types", component: ItemTypesTest },
  { title: "Header/Footer/Separator", component: HeaderFooterTest },
  { title: "Viewability", component: ViewabilityTest },
  { title: "Column Span", component: SpanTest },
];

export function NativeRecyclerTestMenu({
  onSelect,
}: {
  onSelect: (test: TestCase) => void;
}) {
  return (
    <ScrollView style={styles.menu}>
      <Text style={styles.menuTitle}>Native Recycler Tests</Text>
      {testCases.map((test) => (
        <Pressable
          key={test.title}
          style={styles.menuItem}
          onPress={() => onSelect(test)}
        >
          <Text style={styles.menuItemText}>{test.title}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onBack: () => void },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Pressable style={styles.backButton} onPress={this.props.onBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
          <ScrollView style={{ flex: 1, padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "red", marginBottom: 8 }}>
              Error
            </Text>
            <Text style={{ fontSize: 14, color: "#333", fontFamily: "monospace" }}>
              {this.state.error.message}
            </Text>
            <Text style={{ fontSize: 12, color: "#666", marginTop: 8, fontFamily: "monospace" }}>
              {this.state.error.stack}
            </Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

export function NativeRecyclerTestScreen() {
  const [activeTest, setActiveTest] = useState<TestCase | null>(null);

  if (activeTest) {
    const TestComponent = activeTest.component;
    return (
      <ErrorBoundary onBack={() => setActiveTest(null)}>
        <View style={styles.container}>
          <Pressable
            style={styles.backButton}
            onPress={() => setActiveTest(null)}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
          <TestComponent />
        </View>
      </ErrorBoundary>
    );
  }

  return <NativeRecyclerTestMenu onSelect={setActiveTest} />;
}

// ========== Styles ==========

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    fontSize: 16,
    fontWeight: "bold",
    padding: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  info: {
    fontSize: 12,
    padding: 8,
    backgroundColor: "#E3F2FD",
    color: "#1565C0",
  },
  item: {
    padding: 12,
    justifyContent: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#DDD",
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  itemSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  gridItem: {
    flex: 1,
    padding: 8,
    margin: 1,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  gridItemText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  masonryItem: {
    margin: 2,
    padding: 8,
    borderRadius: 4,
    justifyContent: "center",
  },
  horizontalItem: {
    width: 150,
    height: "100%",
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 2,
  },
  featuredItem: {
    padding: 16,
    height: 100,
    justifyContent: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#DDD",
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  featuredSubtitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FF6B00",
    marginTop: 2,
  },
  compactItem: {
    padding: 6,
    height: 36,
    justifyContent: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#DDD",
  },
  compactText: {
    fontSize: 12,
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 8,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
    gap: 6,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#2196F3",
    borderRadius: 4,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
  loadingBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: "#2196F3",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFF",
    fontWeight: "600",
  },
  listHeader: {
    padding: 16,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
  },
  listHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  listFooter: {
    padding: 16,
    backgroundColor: "#FFF3E0",
    alignItems: "center",
  },
  listFooterText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E65100",
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 12,
  },
  menu: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: "bold",
    padding: 16,
    backgroundColor: "#1976D2",
    color: "#FFF",
  },
  menuItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  menuItemText: {
    fontSize: 16,
  },
  backButton: {
    padding: 12,
    backgroundColor: "#1976D2",
  },
  backButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
