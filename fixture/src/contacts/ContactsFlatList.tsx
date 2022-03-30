import React, { useEffect, useState } from "react";
import { SectionList } from "react-native";

import Contact from "../models/Contact";

import ContactSectionHeader from "./ContactSectionHeader";
import ContactDivider from "./ContactDivider";
import ContactCell from "./ContactCell";
import contacts from "./data/contacts";

interface Section {
  title: string;
  data: Contact[];
}

const ContactsFlatList = () => {
  const [data, setData] = useState<Section[]>([]);
  useEffect(() => {
    const sectionedContacts: Section[] = Array.from(contacts.keys())
      .map((key) => {
        return {
          title: key,
          data:
            contacts
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
      renderItem={({ item }) => <ContactCell contact={item} />}
      renderSectionHeader={({ section: { title } }) => (
        <ContactSectionHeader title={title} />
      )}
      ItemSeparatorComponent={ContactDivider}
      sections={data}
    />
  );
};

export default ContactsFlatList;
