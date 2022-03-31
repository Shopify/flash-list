import React from "react";
import { StyleSheet, View } from "react-native";

const ContactDivider = () => {
  return (
    <View style={styles.dividerContainer}>
      <View style={styles.divider} />
    </View>
  );
};

export default ContactDivider;

const styles = StyleSheet.create({
  divider: {
    marginHorizontal: 10,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#DDD",
  },
  dividerContainer: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "white",
  },
});
