import { ViewabilityConfig } from "react-native";

import { RecyclerViewManager } from "../RecyclerViewManager";

import ViewabilityHelper from "./ViewabilityHelper";
import ViewToken from "./ViewToken";

/**
 * Manager for viewability tracking. It holds multiple viewability callback pairs and keeps them updated.
 */
export default class ViewabilityManager<T> {
  private rvManager: RecyclerViewManager<T>;
  private viewabilityHelpers: ViewabilityHelper[] = [];
  private hasInteracted = false;

  constructor(rvManager: RecyclerViewManager<T>) {
    this.rvManager = rvManager;
    if (
      rvManager.props.onViewableItemsChanged !== null &&
      rvManager.props.onViewableItemsChanged !== undefined
    ) {
      this.viewabilityHelpers.push(
        this.createViewabilityHelper(
          rvManager.props.viewabilityConfig,
          (info) => {
            rvManager.props.onViewableItemsChanged?.(info);
          }
        )
      );
    }
    (rvManager.props.viewabilityConfigCallbackPairs ?? []).forEach(
      (pair, index) => {
        this.viewabilityHelpers.push(
          this.createViewabilityHelper(pair.viewabilityConfig, (info) => {
            const callback =
              rvManager.props.viewabilityConfigCallbackPairs?.[index]
                ?.onViewableItemsChanged;
            callback?.(info);
          })
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
    const listSize = this.rvManager.getWindowSize();
    if (listSize === undefined || !this.shouldListenToVisibleIndices) {
      return;
    }
    const scrollOffset =
      (this.rvManager.getAbsoluteLastScrollOffset() ?? 0) -
      this.rvManager.firstItemOffset;
    this.viewabilityHelpers.forEach((viewabilityHelper) => {
      viewabilityHelper.updateViewableItems(
        this.rvManager.props.horizontal ?? false,
        scrollOffset,
        listSize,
        (index: number) => this.rvManager.getLayout(index),
        newViewableIndices
      );
    });
  };

  public recomputeViewableItems = () => {
    this.viewabilityHelpers.forEach((viewabilityHelper) =>
      viewabilityHelper.clearLastReportedViewableIndices()
    );

    this.updateViewableItems();
  };

  /**
   * Creates a new `ViewabilityHelper` instance with `onViewableItemsChanged` callback and `ViewabilityConfig`
   * @returns `ViewabilityHelper` instance
   */
  private createViewabilityHelper = (
    viewabilityConfig: ViewabilityConfig | null | undefined,
    onViewableItemsChanged:
      | ((info: {
          viewableItems: ViewToken<T>[];
          changed: ViewToken<T>[];
        }) => void)
      | null
      | undefined
  ) => {
    const mapViewToken: (index: number, isViewable: boolean) => ViewToken<T> = (
      index: number,
      isViewable: boolean
    ) => {
      const item = this.rvManager.props.data![index];
      const key =
        item === undefined || this.rvManager.props.keyExtractor === undefined
          ? index.toString()
          : this.rvManager.props.keyExtractor(item, index);
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
