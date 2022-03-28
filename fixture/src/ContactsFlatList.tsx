import React, { useEffect, useState } from "react";
import { SectionList, Text, StyleSheet, View } from "react-native";

import contacts from "./data/contacts";
import Contact from "./models/Contact";

interface Section {
  title: string;
  data: Contact[];
}

const Divider = () => {
  return (
    <View style={styles.dividerContainer}>
      <View style={styles.divider} />
    </View>
  );
};

const ContactsFlatList = () => {
  const [data, setData] = useState<Section[]>([]);
  useEffect(() => {
    const groupedContacts = contacts.reduce((contactsMap, contact) => {
      const lastNameInitial = contact.lastName[0];
      const currentLetterContacts = contactsMap.get(lastNameInitial) ?? [];
      contactsMap.set(lastNameInitial, [...currentLetterContacts, contact]);
      return contactsMap;
    }, new Map<string, Contact[]>());
    const sectionedContacts: Section[] = Array.from(groupedContacts.keys())
      .map((key) => {
        return {
          title: key,
          data:
            groupedContacts
              .get(key)
              ?.sort((aContact, bContact) =>
                aContact.lastName.localeCompare(bContact.lastName)
              ) ?? [],
        };
      })
      .sort((aSection, bSection) =>
        aSection.title.localeCompare(bSection.title)
      );
    setData(sectionedContacts);
  }, []);

  return (
    <SectionList
      testID="SectionList"
      keyExtractor={({ lastName }) => lastName}
      renderItem={({ item }) => {
        return (
          <View style={styles.rowContainer}>
            <Text>
              <Text style={styles.firstName}>{item.firstName} </Text>
              <Text style={styles.lastName}>{item.lastName}</Text>
            </Text>
          </View>
        );
      }}
      renderSectionHeader={({ section: { title } }) => (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
      )}
      ItemSeparatorComponent={Divider}
      sections={data}
    />
  );
};

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
  divider: {
    marginHorizontal: 10,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#DDD",
  },
  dividerContainer: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "white",
  },
  headerTitle: {
    paddingLeft: 10,
    paddingVertical: 4,
  },
  header: {
    backgroundColor: "FAFAFA",
  },
});

export default ContactsFlatList;
