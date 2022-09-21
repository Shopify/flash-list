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
    { title: "List", destination: "List" },
    { title: "PaginatedList", destination: "PaginatedList" },
    { title: "Reminders", destination: "Reminders" },
    { title: "Twitter Timeline", destination: "Twitter" },
    {
      title: "Twitter FlatList Timeline",
      destination: "TwitterFlatList",
    },
    {
      title: "Contacts",
      destination: "Contacts",
    },
    {
      title: "Contacts SectionList",
      destination: "ContactsSectionList",
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
      title: "Twitter Benchmark",
      destination: "TwitterBenchmark",
    },
    {
      title: "Twitter Custom Cell Container",
      destination: "TwitterCustomCellContainer",
    },
    { title: "Masonry", destination: "Masonry" },
  ];
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <FlatList
        testID="ExamplesFlatList"
        keyExtractor={(item) => item.destination}
        data={data}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => {
              navigate(item.destination);
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
