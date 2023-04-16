export default interface ViewToken<TItem> {
  item: TItem;
  key: string;
  index: number | null;
  isViewable: boolean;
  timestamp: number;
}
