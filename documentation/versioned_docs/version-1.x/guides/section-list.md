---
id: section-list
title: SectionList
---

React Native has a convenience component on top of `FlatList`, called [`SectionList`](https://reactnative.dev/docs/sectionlist). This component has some additional props:

- [`sections`](https://reactnative.dev/docs/sectionlist#requiredsections)
- [`renderSectionFooter`](https://reactnative.dev/docs/sectionlist#rendersectionfooter)
- [`renderSectionHeader`](https://reactnative.dev/docs/sectionlist#rendersectionheader)
- [`SectionSeparatorComponent`](https://reactnative.dev/docs/sectionlist#sectionseparatorcomponent)
- [`stickySectionHeadersEnabled`](https://reactnative.dev/docs/sectionlist#stickysectionheadersenabled)

**`FlashList` offers none of these props but all of them are replaceable with existing props.**

The difficulty of migrating from `SectionList` to `FlashList` will depend on the data you have at hand - the data may be more suitable for `SectionList`, requiring you to massage the data, but the opposite can be true as well. In that case, using `FlashList` instead of `SectionList` might even result in less code.

Let's go through how to migrate from `SectionList` to `FlashList` in the following example - a contacts list.

This is how we could write such a list with `SectionList`:

```tsx
import React from "react";
import { SectionList, StyleSheet, Text } from "react-native";

interface Contact {
  firstName: string;
  lastName: string;
}

interface Section {
  title: string;
  data: Contact[];
}

const contacts: Section[] = [
  { title: "A", data: [{ firstName: "John", lastName: "Aaron" }] },
  {
    title: "D",
    data: [
      { firstName: "John", lastName: "Doe" },
      { firstName: "Mary", lastName: "Dianne" },
    ],
  },
];

const ContactsSectionList = () => {
  return (
    <SectionList
      sections={contacts}
      renderItem={({ item }) => {
        return <Text>{item.firstName}</Text>;
      }}
      renderSectionHeader={({ section: { title } }) => (
        <Text style={styles.header}>{title}</Text>
      )}
    />
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 32,
    backgroundColor: "#fff",
  },
});
```

To migrate to `FlashList`, we'd need to first convert the `contacts` variable to the following:

```tsx
const contacts: (string | Contact)[] = [
  "A",
  { firstName: "John", lastName: "Aaron" },
  "D",
  { firstName: "John", lastName: "Doe" },
  { firstName: "Mary", lastName: "Dianne" },
];
```

As you can see, you can add the section item right along with the data. Then in the `renderItem`, you can distinguish what to render based on the type of the item:

```tsx
const ContactsFlashList = () => {
  return (
    <FlashList
      data={contacts}
      renderItem={({ item }) => {
        if (typeof item === "string") {
          // Rendering header
          return <Text style={styles.header}>{item}</Text>;
        } else {
          // Render item
          return <Text>{item.firstName}</Text>;
        }
      }}
      getItemType={(item) => {
        // To achieve better performance, specify the type based on the item
        return typeof item === "string" ? "sectionHeader" : "row";
      }}
      estimatedItemSize={100}
    />
  );
};
```

You can follow a similar pattern as for `renderItem` for the rest of the `SectionList`'s props.

If you want your section headers to be sticky, you will also need to compute the array for `stickyHeaderIndices`:

```tsx
const stickyHeaderIndices = contacts
  .map((item, index) => {
    if (typeof item === "string") {
      return index;
    } else {
      return null;
    }
  })
  .filter((item) => item !== null) as number[];
```

And that's it! Below you can find the whole example for `FlashList`:

```tsx
import React from "react";
import { StyleSheet, Text } from "react-native";
import { FlashList } from "@shopify/flash-list";

interface Contact {
  firstName: string;
  lastName: string;
}

const contacts: (string | Contact)[] = [
  "A",
  { firstName: "John", lastName: "Aaron" },
  "D",
  { firstName: "John", lastName: "Doe" },
  { firstName: "Mary", lastName: "Dianne" },
];

const stickyHeaderIndices = contacts
  .map((item, index) => {
    if (typeof item === "string") {
      return index;
    } else {
      return null;
    }
  })
  .filter((item) => item !== null) as number[];

const ContactsFlashList = () => {
  return (
    <FlashList
      data={contacts}
      renderItem={({ item }) => {
        if (typeof item === "string") {
          // Rendering header
          return <Text style={styles.header}>{item}</Text>;
        } else {
          // Render item
          return <Text>{item.firstName}</Text>;
        }
      }}
      stickyHeaderIndices={stickyHeaderIndices}
      getItemType={(item) => {
        // To achieve better performance, specify the type based on the item
        return typeof item === "string" ? "sectionHeader" : "row";
      }}
      estimatedItemSize={100}
    />
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 32,
    backgroundColor: "#fff",
  },
});
```
