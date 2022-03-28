import React from "react";
import { StatusBar, StyleSheet, FlatList, Text, Pressable } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";

import { DebugButton } from "./Debug";
import { NavigationKeys, RootStackParamList } from "./constants";

export const ExamplesScreen = () => {
  const { navigate } =
    useNavigation<StackNavigationProp<RootStackParamList, "Examples">>();

  const onDebugButton = () => {
    navigate(NavigationKeys.DEBUG);
  };

  const data = [
    { title: "List", destination: NavigationKeys.LIST },
    { title: "PaginatedList", destination: NavigationKeys.PAGINATED_LIST },
    { title: "Reminders", destination: NavigationKeys.REMINDERS },
    { title: "Twitter Timeline", destination: NavigationKeys.TWITTER },
    {
      title: "Twitter FlatList Timeline",
      destination: NavigationKeys.TWITTER_FLAT_LIST,
    },
    {
      title: "Contacts FlatList",
      destination: NavigationKeys.CONTACTS_FLAT_LIST,
    },
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
