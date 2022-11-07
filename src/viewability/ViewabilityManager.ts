import { ViewabilityConfig } from "react-native";

import FlashList from "../FlashList";

import ViewabilityHelper from "./ViewabilityHelper";
import ViewToken from "./ViewToken";

/**
 * Manager for viewability tracking. It holds multiple viewability callback pairs and keeps them updated.
 */
export default class ViewabilityManager<T> {
  private flashListRef: FlashList<T>;
  private viewabilityHelpers: ViewabilityHelper[] = [];
  private hasInteracted = false;

  constructor(flashListRef: FlashList<T>) {
    this.flashListRef = flashListRef;
    if (
      flashListRef.props.onViewableItemsChanged !== null &&
      flashListRef.props.onViewableItemsChanged !== undefined
    ) {
      this.viewabilityHelpers.push(
        this.createViewabilityHelper(
          flashListRef.props.viewabilityConfig,
          flashListRef.props.onViewableItemsChanged
        )
      );
    }
    (flashListRef.props.viewabilityConfigCallbackPairs ?? []).forEach(
      (pair) => {
        this.viewabilityHelpers.push(
          this.createViewabilityHelper(
            pair.viewabilityConfig,
            pair.onViewableItemsChanged
          )
        );
      }
    );
  }

  /**
   * @returns true if the viewability manager has any viewability callback pairs registered.
   */
  public get shouldListenToVisibleIndices() {
    return this.viewabilityHelpers.length > 0;
  }

  public dispose = () => {
    this.viewabilityHelpers.forEach((viewabilityHelper) =>
      viewabilityHelper.dispose()
    );
  };

  public onVisibleIndicesChanged = (all: number[]) => {
    this.updateViewableItems(all);
  };

  public recordInteraction = () => {
    if (this.hasInteracted) {
      return;
    }
    this.hasInteracted = true;
    this.viewabilityHelpers.forEach((viewabilityHelper) => {
      viewabilityHelper.hasInteracted = true;
    });
    this.updateViewableItems();
  };

  public updateViewableItems = (newViewableIndices?: number[]) => {
    const listSize =
      this.flashListRef.recyclerlistview_unsafe?.getRenderedSize() ??
      this.flashListRef.props.estimatedListSize;
    if (listSize === undefined || !this.shouldListenToVisibleIndices) {
      return;
    }
    const scrollOffset =
      (this.flashListRef.recyclerlistview_unsafe?.getCurrentScrollOffset() ??
        0) - this.flashListRef.firstItemOffset;
    this.viewabilityHelpers.forEach((viewabilityHelper) => {
      viewabilityHelper.updateViewableItems(
        this.flashListRef.props.horizontal ?? false,
        scrollOffset,
        listSize,
        (index: number) =>
          this.flashListRef.recyclerlistview_unsafe?.getLayout(index),
        newViewableIndices
      );
    });
  };

  /**
   * Creates a new `ViewabilityHelper` instance with `onViewableItemsChanged` callback and `ViewabilityConfig`
   * @returns `ViewabilityHelper` instance
   */
  private createViewabilityHelper = (
    viewabilityConfig: ViewabilityConfig | null | undefined,
    onViewableItemsChanged:
      | ((info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => void)
      | null
      | undefined
  ) => {
    const mapViewToken: (index: number, isViewable: boolean) => ViewToken = (
      index: number,
      isViewable: boolean
    ) => {
      const item = this.flashListRef.props.data?.[index];
      const key =
        item === undefined || this.flashListRef.props.keyExtractor === undefined
          ? index.toString()
          : this.flashListRef.props.keyExtractor(item, index);
      return {
        index,
        isViewable,
        item,
        key,
        timestamp: Date.now(),
      };
    };
    return new ViewabilityHelper(
      viewabilityConfig,
      (indices, newlyVisibleIndices, newlyNonvisibleIndices) => {
        onViewableItemsChanged?.({
          viewableItems: indices.map((index) => mapViewToken(index, true)),
          changed: [
            ...newlyVisibleIndices.map((index) => mapViewToken(index, true)),
            ...newlyNonvisibleIndices.map((index) =>
              mapViewToken(index, false)
            ),
          ],
        });
      }
    );
  };
}
