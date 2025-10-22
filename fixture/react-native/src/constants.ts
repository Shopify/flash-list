import { TweetContentProps } from "./twitter/TweetContent";

// `react-navigation` expects to work with type instead of interface
/* eslint-disable @typescript-eslint/consistent-type-definitions */
export type RootStackParamList = {
  Examples: undefined;
  List: undefined;
  SectionList: undefined;
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
  ComplexMasonry: undefined;
  Grid: undefined;
  DynamicColumnSpan: undefined;
  HorizontalList: undefined;
  Chat: undefined;
  CellRendererExamples: undefined;
  HeaderFooterExample: undefined;
  DynamicItems: undefined;
  RecyclerViewHandlerTest: undefined;
  MovieList: undefined;
  Carousel: undefined;
  LayoutOptions: undefined;
  ShowcaseApp: undefined;
  LotOfItems: undefined;
  ManualBenchmarkExample: undefined;
  ManualFlatListBenchmarkExample: undefined;
  StickyHeaderExample: undefined;
};
