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
<<<<<<< HEAD
      testID="FlashList"
      estimatedItemSize={44}
      data={data}
      renderItem={({ item }) => {
=======
      estimatedItemSize={100}
      data={data}
      renderItem={({ item }) => {
        // item will never be string since it will be rendered with `StickyHeaderComponent`
>>>>>>> d65617a0 (Add FlashList contacts)
        if (typeof item === "string") {
          return <ContactSectionHeader title={item} />;
        } else {
          return <ContactCell contact={item as Contact} />;
        }
      }}
<<<<<<< HEAD
      ItemSeparatorComponent={ContactDivider}
      stickyHeaderIndices={stickyHeaderIndices}
      ListHeaderComponent={ContactHeader}
      initialScrollIndex={debugContext.initialScrollIndex}
=======
      stickyHeaderIndices={stickyHeaderIndices}
      //   StickyHeaderComponent={({ title }) => {
      //     return <ContactSectionHeader title={title} />;
      //   }}
>>>>>>> d65617a0 (Add FlashList contacts)
    />
  );
};

export default Contacts;
