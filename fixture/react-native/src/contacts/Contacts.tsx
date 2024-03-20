import React, { useContext, useEffect, useState } from "react";
import { FlashList } from "@shopify/flash-list";

import { DebugContext } from "../Debug";

import Contact from "./models/Contact";
import contacts from "./data/contacts";
import ContactCell from "./ContactCell";
import ContactSectionHeader from "./ContactSectionHeader";
import ContactHeader from "./ContactHeader";
import ContactDivider from "./ContactDivider";

const Contacts = () => {
  const debugContext = useContext(DebugContext);
  const [data, setData] = useState<(Contact | string)[]>([]);
  useEffect(() => {
    const contactsWithTitles = Array.from(contacts.keys())
      .sort((aKey, bKey) => aKey.localeCompare(bKey))
      .flatMap((key) => {
        return [key, ...(contacts.get(key) ?? [])];
      });
    setData(contactsWithTitles);
  }, []);

  const stickyHeaderIndices = data
    .map((item, index) => {
      if (typeof item === "string") {
        return index;
      } else {
        return null;
      }
    })
    .filter((item) => item !== null) as number[];

  return (
    <FlashList
      testID="FlashList"
      estimatedItemSize={44}
      data={data}
      renderItem={({ item }) => {
        if (typeof item === "string") {
          return <ContactSectionHeader title={item} />;
        } else {
          return <ContactCell contact={item as Contact} />;
        }
      }}
      getItemType={(item) => {
        return typeof item === "string" ? "sectionHeader" : "row";
      }}
      ItemSeparatorComponent={ContactDivider}
      stickyHeaderIndices={stickyHeaderIndices}
      ListHeaderComponent={ContactHeader}
      initialScrollIndex={debugContext.initialScrollIndex}
    />
  );
};

export default Contacts;
