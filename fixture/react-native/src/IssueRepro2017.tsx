/**
 * Reproduction for issue #2017: Duplicate sticky headers when content is placed
 * above FlashList in the same View container.
 *
 * On Fabric (New Architecture), view.measureLayout(view) incorrectly returns the
 * view's absolute position in its parent instead of (0,0). The old code subtracted
 * this from firstItemOffset, causing the sticky header overlay to activate too early
 * (before the in-list header had scrolled off screen), producing a visible duplicate.
 *
 * Repro: enable sticky headers and scroll down slowly — you should see only ONE
 * header at any time. Before the fix you would see two.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";

interface Item {
  type: "header" | "item";
  label: string;
}

const SECTION_SIZE = 15;
const NUM_SECTIONS = 10;

const data: Item[] = [];
for (let section = 0; section < NUM_SECTIONS; section++) {
  data.push({ type: "header", label: `Section ${section + 1}` });
  for (let item = 0; item < SECTION_SIZE; item++) {
    data.push({
      type: "item",
      label: `Item ${section * SECTION_SIZE + item + 1}`,
    });
  }
}

const stickyHeaderIndices = data
  .map((item, index) => (item.type === "header" ? index : null))
  .filter((i): i is number => i !== null);

const renderItem = ({ item }: { item: Item }) =>
  item.type === "header" ? (
    <View style={styles.header}>
      <Text style={styles.headerText}>{item.label}</Text>
    </View>
  ) : (
    <View style={styles.item}>
      <Text>{item.label}</Text>
    </View>
  );

export default function IssueRepro2017() {
  return (
    <View style={styles.root}>
      {/* This banner above FlashList is what triggers the Fabric bug.
          Without the fix, the sticky header activates too early because
          measureParentSize returns a non-zero y on Fabric. */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          Content above FlashList (triggers #2017)
        </Text>
      </View>

      {/* No extra wrapping View needed — the fix makes this work correctly */}
      <FlashList
        data={data}
        renderItem={renderItem}
        estimatedItemSize={44}
        stickyHeaderIndices={stickyHeaderIndices}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  banner: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  bannerText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
  header: {
    height: 44,
    backgroundColor: "#FFAB40",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  headerText: {
    fontWeight: "700",
  },
  item: {
    height: 44,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
});
