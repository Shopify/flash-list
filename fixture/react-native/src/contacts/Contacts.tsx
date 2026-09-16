import React, { useContext, useMemo, useState } from "react";
import { FlashList } from "@shopify/flash-list";
import { ScrollView } from "react-native";

import { DebugContext } from "../Debug/DebugContext";

import Contact from "./models/Contact";
import contacts from "./data/contacts";
import ContactCell from "./ContactCell";
import ContactSectionHeader from "./ContactSectionHeader";
import ContactHeader from "./ContactHeader";
import ContactDivider from "./ContactDivider";

const Contacts = () => {
  const debugContext = useContext(DebugContext);
  const [data] = useState<(Contact | string)[]>(() =>
    Array.from(contacts.keys())
      .sort((aKey, bKey) => aKey.localeCompare(bKey))
      .flatMap((key) => {
        return [key, ...(contacts.get(key) ?? [])];
      })
  );

  const stickyHeaderIndices = useMemo(() => {
    const indices: number[] = [];
    data.forEach((item, index) => {
      if (typeof item === "string") indices.push(index);
    });
    return indices;
  }, [data]);

  return (
    <FlashList
      testID="FlashList"
      data={data}
      renderItem={({ item }) => {
        if (typeof item === "string") {
          return <ContactSectionHeader title={item} />;
        } else {
          return <ContactCell contact={item} />;
        }
      }}
      getItemType={(item) => {
        return typeof item === "string" ? "sectionHeader" : "row";
      }}
      ItemSeparatorComponent={ContactDivider}
      stickyHeaderIndices={stickyHeaderIndices}
      ListHeaderComponent={ContactHeader}
      initialScrollIndex={debugContext.initialScrollIndex}
      renderScrollComponent={ScrollView}
    />
  );
};

export default Contacts;
