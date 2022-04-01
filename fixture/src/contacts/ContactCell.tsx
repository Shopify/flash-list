import React from "react";
import { StyleSheet, View, Text } from "react-native";

import Contact from "./models/Contact";

interface ContactCellProps {
  contact: Contact;
}

const ContactCell = ({ contact }: ContactCellProps) => {
  return (
    <View style={styles.rowContainer}>
      <Text>
        <Text style={styles.firstName}>{contact.firstName} </Text>
        <Text style={styles.lastName}>{contact.lastName}</Text>
      </Text>
    </View>
  );
};

export default ContactCell;

const styles = StyleSheet.create({
  rowContainer: {
    backgroundColor: "white",
    padding: 10,
  },
  firstName: {
    fontSize: 18,
  },
  lastName: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
