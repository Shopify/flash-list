import React, { useContext, useEffect, useMemo, useState } from "react";
import { RecyclerView } from "@shopify/flash-list";

import { DebugContext } from "../Debug";

import Contact from "./models/Contact";
import contacts from "./data/contacts";
import ContactCell from "./ContactCell";
import ContactSectionHeader from "./ContactSectionHeader";
import ContactHeader from "./ContactHeader";
import ContactDivider from "./ContactDivider";
import { ScrollView } from "react-native";

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

  const renderScrollComponent = useMemo(() => {
    return (props: any) => {
      return <ScrollView {...props} />;
    };
  }, []);

  return (
    <RecyclerView
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
      renderScrollComponent={renderScrollComponent}
    />
  );
};

export default Contacts;
