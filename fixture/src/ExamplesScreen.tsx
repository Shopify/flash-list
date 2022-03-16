import React from "react";
import {
  StatusBar,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";

import { NavigationKeys, RootStackParamList } from "./constants";

export const ExamplesScreen = () => {
  const { navigate } =
    useNavigation<StackNavigationProp<RootStackParamList, "Examples">>();

  const data = [
    { title: "List", destination: NavigationKeys.LIST },
    { title: "PaginatedList", destination: NavigationKeys.PAGINATED_LIST },
    { title: "Reminders", destination: NavigationKeys.REMINDERS },
    { title: "Twitter Timeline", destination: NavigationKeys.TWITTER },
    {
      title: "Twitter FlatList Timeline",
      destination: NavigationKeys.TWITTER_FLAT_LIST,
    },
  ];
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <FlatList
        keyExtractor={(item) => item.destination}
        data={data}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => {
              navigate(item.destination);
            }}
          >
            <Text style={styles.rowTitle}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
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
