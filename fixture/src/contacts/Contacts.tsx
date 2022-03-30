import React, { useEffect, useState } from "react";
import { FlashList } from "@shopify/flash-list";

import Contact from "../models/Contact";

import contacts from "./data/contacts";
import ContactCell from "./ContactCell";
import ContactSectionHeader from "./ContactSectionHeader";

const Contacts = () => {
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
      estimatedItemSize={100}
      data={data}
      renderItem={({ item }) => {
        // item will never be string since it will be rendered with `StickyHeaderComponent`
        if (typeof item === "string") {
          return <ContactSectionHeader title={item} />;
        } else {
          return <ContactCell contact={item as Contact} />;
        }
      }}
      stickyHeaderIndices={stickyHeaderIndices}
      //   StickyHeaderComponent={({ title }) => {
      //     return <ContactSectionHeader title={title} />;
      //   }}
    />
  );
};

export default Contacts;
