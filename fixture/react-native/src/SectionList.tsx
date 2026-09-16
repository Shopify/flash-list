/** *
 Use this component inside your React Native Application.
 A scrollable list with different item type
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  LayoutAnimation,
  StyleSheet,
} from "react-native";
import {
  FlashList,
  FlashListRef,
  ListRenderItemInfo,
} from "@shopify/flash-list";

const generateItemsArray = (size: number) => {
  const arr = new Array(size);
  for (let i = 0; i < size; i++) {
    arr[i] = i;
  }
  return arr;
};

const generateSectionsData = (size: number, index = 0) => {
  const arr = new Array<{ index: number; data: number[] }>(size);
  for (let i = 0; i < size; i++) {
    arr[i] = {
      index: index + i,
      data: generateItemsArray(10),
    };
  }
  return arr;
};

interface Section {
  type: "section";
  index: number;
}

interface Item {
  type: "item";
  index: number;
  sectionIndex: number;
}

type SectionListItem = Section | Item;

export const SectionList = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [sections, setSections] = useState(() => generateSectionsData(10));
  const refreshTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (refreshTimeout.current !== null) {
        clearTimeout(refreshTimeout.current);
        refreshTimeout.current = null;
      }
    },
    []
  );

  const list = useRef<FlashListRef<SectionListItem> | null>(null);

  const flattenedSections = useMemo(
    () =>
      sections.flatMap<SectionListItem>(({ index, data }) => {
        const items: Item[] = data.map((itemIndex) => ({
          type: "item",
          index: itemIndex,
          sectionIndex: index,
        }));

        return [{ index, type: "section" }, ...items];
      }),
    [sections]
  );

  const stickyHeaderIndices = useMemo(
    () =>
      flattenedSections
        .map((item, index) => (item.type === "section" ? index : undefined))
        .filter((item) => item !== undefined) as number[],
    [flattenedSections]
  );

  const removeItem = (item: Item) => {
    list.current?.prepareForLayoutAnimationRender();
    setSections((previous) =>
      previous.map((section) =>
        section.index === item.sectionIndex
          ? {
              ...section,
              data: section.data.filter((index) => index !== item.index),
            }
          : section
      )
    );
    // after removing the item, we start animation
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const removeSection = () => {
    list.current?.prepareForLayoutAnimationRender();
    setSections((previous) => previous.slice(1));
    // after removing the item, we start animation
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const addSection = () => {
    list.current?.prepareForLayoutAnimationRender();
    setSections((previous) => {
      const lastIndex = previous[previous.length - 1]?.index ?? -1;
      return [...previous, ...generateSectionsData(1, lastIndex + 1)];
    });
    // after removing the item, we start animation
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const renderItem = ({ item }: ListRenderItemInfo<SectionListItem>) => {
    if (item.type === "section") {
      return (
        <View
          style={{
            ...styles.container,
            backgroundColor: "purple",
            width: "100%",
            height: 30,
          }}
        >
          <Text>Section: {item.index}</Text>
        </View>
      );
    }

    const backgroundColor = item.index % 2 === 0 ? "#00a1f1" : "#ffbb00";

    return (
      <Pressable onPress={() => removeItem(item)}>
        <View
          style={{
            ...styles.container,
            backgroundColor: item.index > 97 ? "red" : backgroundColor,
            height: item.index % 2 === 0 ? 100 : 200,
          }}
        >
          <Text>
            Section: {item.sectionIndex} Cell Id: {item.index}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <>
      <View style={styles.buttonsContainer}>
        <Pressable onPress={addSection}>
          <View style={styles.button}>
            <Text>Add Section</Text>
          </View>
        </Pressable>
        <Pressable onPress={removeSection}>
          <View style={styles.button}>
            <Text>Remove Section</Text>
          </View>
        </Pressable>
      </View>

      {/* @ts-ignore - Type compatibility issue between different React versions */}
      <FlashList
        ref={list}
        refreshing={refreshing}
        onRefresh={() => {
          if (refreshTimeout.current !== null) return;
          setRefreshing(true);
          refreshTimeout.current = setTimeout(() => {
            refreshTimeout.current = null;
            setRefreshing(false);
          }, 2000);
        }}
        keyExtractor={(item) =>
          item.type === "section"
            ? `section:${item.index}`
            : `item:${item.sectionIndex}:${item.index}`
        }
        renderItem={renderItem}
        stickyHeaderIndices={stickyHeaderIndices}
        data={flattenedSections}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-around",
    alignItems: "center",
    height: 120,
    backgroundColor: "#00a1f1",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  button: {
    padding: 10,
  },
});
