export default interface ViewToken<T> {
  item: T;
  key: string;
  index: number | null;
  isViewable: boolean;
  timestamp: number;
}
