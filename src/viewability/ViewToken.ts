export default interface ViewToken {
  item: any; // TODO: fix this type
  key: string;
  index: number | null;
  isViewable: boolean;
  timestamp: number;
}
