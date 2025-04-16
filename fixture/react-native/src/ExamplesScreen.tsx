import React from "react";
import { StatusBar, StyleSheet, FlatList, Text, Pressable } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";

import { DebugButton } from "./Debug";
import { RootStackParamList } from "./constants";

interface ExampleItem {
  title: string;
  destination: keyof RootStackParamList;
}

export const ExamplesScreen = () => {
  const { navigate } =
    useNavigation<StackNavigationProp<RootStackParamList, "Examples">>();

  const onDebugButton = () => {
    navigate("Debug");
  };

  const data: ExampleItem[] = [
    { title: "Horizontal List", destination: "HorizontalList" },
    { title: "Carousel", destination: "Carousel" },
    { title: "Grid", destination: "Grid" },
    { title: "Masonry", destination: "Masonry" },
    { title: "Complex Masonry", destination: "ComplexMasonry" },
    {
      title: "Chat",
      destination: "Chat",
    },
    {
      title: "RecyclerView Handler Test",
      destination: "RecyclerViewHandlerTest",
    },
    {
      title: "Contacts",
      destination: "Contacts",
    },
    {
      title: "Contacts SectionList",
      destination: "ContactsSectionList",
    },
    { title: "SectionList", destination: "SectionList" },
    { title: "PaginatedList", destination: "PaginatedList" },

    { title: "Twitter Timeline", destination: "Twitter" },

    {
      title: "Twitter FlatList Timeline",
      destination: "TwitterFlatList",
    },
    {
      title: "Twitter Benchmark",
      destination: "TwitterBenchmark",
    },
    { title: "List", destination: "List" },

    { title: "Reminders", destination: "Reminders" },
    {
      title: "Dynamic Items",
      destination: "DynamicItems",
    },
    {
      title: "Messages",
      destination: "Messages",
    },
    {
      title: "Messages FlatList",
      destination: "MessagesFlatList",
    },
    {
      title: "CellRenderer Examples",
      destination: "CellRendererExamples",
    },
    {
      title: "Header Footer Empty Example",
      destination: "HeaderFooterExample",
    },

    {
      title: "Movie Streaming",
      destination: "MovieList",
    },
    {
      title: "Layout Options",
      destination: "LayoutOptions",
    },
  ];
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <FlatList
        testID="ExamplesFlatList"
        keyExtractor={(item) => item.destination}
        data={data}
        removeClippedSubviews={false}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => {
              navigate(item.destination as any);
            }}
            testID={item.title}
          >
            <Text style={styles.rowTitle}>{item.title}</Text>
          </Pressable>
        )}
      />
      <DebugButton onPress={onDebugButton} />
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    padding: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rowTitle: {
    fontSize: 18,
  },
});
