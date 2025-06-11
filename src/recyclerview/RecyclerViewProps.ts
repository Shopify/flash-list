import { ScrollViewProps } from "react-native";

import { FlashListProps } from "../FlashListProps";

export interface RecyclerViewProps<TItem>
  extends Omit<FlashListProps<TItem>, "contentContainerStyle"> {
  /**
   * Style for the RecyclerView's parent container.
   */
  contentContainerStyle?: ScrollViewProps["contentContainerStyle"];
}
