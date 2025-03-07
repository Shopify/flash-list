import { FlashListProps } from "../FlashListProps";

export interface RecyclerViewProps<TItem> {
  horizontal?: FlashListProps<TItem>["horizontal"];
  data: FlashListProps<TItem>["data"];
  numColumns?: FlashListProps<TItem>["numColumns"];
  extraData?: FlashListProps<TItem>["extraData"];
  masonry?: boolean;
  initialScrollIndex?: FlashListProps<TItem>["initialScrollIndex"];
  onLoad?: FlashListProps<TItem>["onLoad"];
  renderItem: FlashListProps<TItem>["renderItem"];
  keyExtractor?: FlashListProps<TItem>["keyExtractor"];
  getItemType?: FlashListProps<TItem>["getItemType"];
  overrideItemLayout?: FlashListProps<TItem>["overrideItemLayout"];
}
