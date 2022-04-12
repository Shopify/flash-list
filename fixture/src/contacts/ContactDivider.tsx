import React from "react";
import { StyleSheet, View } from "react-native";

import Contact from "./models/Contact";

interface ContactDividerProps {
  leadingItem: Contact | string;
  trailingItem: Contact | string;
}

const ContactDivider = ({ leadingItem, trailingItem }: ContactDividerProps) => {
  if (typeof leadingItem === "string" || typeof trailingItem === "string") {
    return null;
  }
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
