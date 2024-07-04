import { TweetContentProps } from "./twitter/TweetContent";

// `react-navigation` expects to work with type instead of interface
/* eslint-disable @typescript-eslint/consistent-type-definitions */
export type RootStackParamList = {
  Examples: undefined;
  List: undefined;
  Reminders: undefined;
  PaginatedList: undefined;
  Twitter: undefined;
  TwitterFlatList: undefined;
  TweetDetailScreen: TweetContentProps;
  Debug: undefined;
  Contacts: undefined;
  ContactsSectionList: undefined;
  Messages: undefined;
  MessagesFlatList: undefined;
  TwitterBenchmark: undefined;
  TwitterCustomCellContainer: undefined;
  Masonry: undefined;
};
