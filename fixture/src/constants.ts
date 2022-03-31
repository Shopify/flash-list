export const NavigationKeys = {
  EXAMPLES: "Examples" as const,
  LIST: "List" as const,
  REMINDERS: "Reminders" as const,
  PAGINATED_LIST: "PaginatedList" as const,
  TWITTER: "Twitter" as const,
  TWITTER_FLAT_LIST: "TwitterFlatList" as const,
  DEBUG: "Debug" as const,
  CONTACTS: "Contacts" as const,
  CONTACTS_SECTION_LIST: "ContactsSectionList" as const,
};

type ValueOf<T> = T[keyof T];

export type RootStackParamList = {
  [key in ValueOf<typeof NavigationKeys>]: undefined;
};
