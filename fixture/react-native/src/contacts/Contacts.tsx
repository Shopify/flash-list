import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { FlashList } from "@shopify/flash-list";
import { ScrollView } from "react-native";

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

  const isStickyItem = useCallback(
    (item: Contact | string) => typeof item === "string",
    []
  );

  const renderScrollComponent = useMemo(() => {
    // eslint-disable-next-line react/display-name
    return (props: any) => {
      return <ScrollView {...props} />;
    };
  }, []);

  return (
    <FlashList
      testID="FlashList"
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
      isStickyItem={isStickyItem}
      ListHeaderComponent={ContactHeader}
      initialScrollIndex={debugContext.initialScrollIndex}
      renderScrollComponent={renderScrollComponent}
    />
  );
};

export default Contacts;
