import { FlashListProps } from "../FlashListProps";
import { ScrollViewProps } from "react-native";

export interface RecyclerViewProps<TItem>
  extends Omit<FlashListProps<TItem>, "contentContainerStyle"> {
  /**
   * Style for the RecyclerView's parent container.
   */
  contentContainerStyle?: ScrollViewProps["contentContainerStyle"];
}
