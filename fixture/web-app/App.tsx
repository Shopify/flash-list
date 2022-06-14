import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";

import List from "./List";

export default function App() {
  return (
    <View style={styles.container}>
      <List />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width,
  },
});
