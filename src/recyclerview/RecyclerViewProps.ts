import { FlashListProps } from "../FlashListProps";

import { SpanSizeInfo } from "./LayoutManager";

export interface RecyclerViewProps<TItem> {
  horizontal?: boolean;
  data: ReadonlyArray<TItem> | null | undefined;
  numColumns?: number;
  extraData?: any;
  renderItem: FlashListProps<TItem>["renderItem"];
  keyExtractor?: ((item: TItem, index: number) => string) | undefined;
  getItemType?: (
    item: TItem,
    index: number,
    extraData?: any
  ) => string | number | undefined;
  overrideItemLayout?: (
    layout: SpanSizeInfo,
    item: TItem,
    index: number,
    maxColumns: number,
    extraData?: any
  ) => void;
}
