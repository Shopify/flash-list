import {
  Dimension,
  GridLayoutProvider,
  Layout,
  LayoutManager,
} from "recyclerlistview";

import { FlashListProps } from "./FlashListProps";
import { AverageWindow } from "./utils/AverageWindow";
import { applyContentContainerInsetForLayoutManager } from "./utils/ContentContainerUtils";

export default class GridLayoutProviderWithProps<T> extends GridLayoutProvider {
  private props: FlashListProps<T>;
  private layoutObject = { span: undefined, size: undefined };
  private averageWindow: AverageWindow;
  private renderWindowInsets: Dimension = { width: 0, height: 0 };
  private _hasExpired = false;
  public defaultEstimatedItemSize = 100;

  constructor(
    maxSpan: number,
    getLayoutType: (
      index: number,
      props: FlashListProps<T>,
      mutableLayout: { span?: number; size?: number }
    ) => string | number,
    getSpan: (
      index: number,
      props: FlashListProps<T>,
      mutableLayout: { span?: number; size?: number }
    ) => number,
    getHeightOrWidth: (
      index: number,
      props: FlashListProps<T>,
      mutableLayout: { span?: number; size?: number }
    ) => number | undefined,
    props: FlashListProps<T>,
    acceptableRelayoutDelta?: number
  ) {
    super(
      maxSpan,
      (i) => {
        return getLayoutType(i, this.props, this.getCleanLayoutObj());
      },
      (i) => {
        return getSpan(i, this.props, this.getCleanLayoutObj());
      },
      (i) => {
        return (
          // Using average item size if no override has been provided by the developer
          getHeightOrWidth(i, this.props, this.getCleanLayoutObj()) ??
          this.averageItemSize
        );
      },
      acceptableRelayoutDelta
    );
    this.props = props;
    this.averageWindow = new AverageWindow(
      1,
      props.estimatedItemSize ?? this.defaultEstimatedItemSize
    );
    this.renderWindowInsets = this.getAdjustedRenderWindowSize(
      this.renderWindowInsets
    );
  }

  public updateProps(props: FlashListProps<T>): GridLayoutProviderWithProps<T> {
    const newInsetValues = applyContentContainerInsetForLayoutManager(
      {
        height: 0,
        width: 0,
      },
      props.contentContainerStyle,
      Boolean(props.horizontal)
    );
    this._hasExpired =
      this._hasExpired ||
      this.props.numColumns !== props.numColumns ||
      newInsetValues.height !== this.renderWindowInsets.height ||
      newInsetValues.width !== this.renderWindowInsets.width;
    this.renderWindowInsets = newInsetValues;
    this.props = props;
    return this;
  }

  /**
   * This methods returns true if the layout provider has expired and needs to be recreated.
   * This can happen if the number of columns has changed or the render window size has changed in a way that cannot be handled by the layout provider internally.
   */
  public get hasExpired() {
    return this._hasExpired;
  }

  /**
   * Calling this method will mark the layout provider as expired. As a result, a new one will be created by FlashList and old cached layouts will be discarded.
   */
  public markExpired() {
    this._hasExpired = true;
  }

  /**
   * Calling this method will help the layout provider track average item sizes on its own
   * Overriding layout manager can help achieve the same thing without relying on this method being called however, it will make implementation very complex for a simple use case
   * @param index Index of the item being reported
   */
  public reportItemLayout(index: number) {
    const layout = this.getLayoutManager()?.getLayouts()[index];
    if (layout) {
      // For the same index we can now return different estimates because average is updated in realtime
      // Marking the layout as overridden will help layout manager avoid using the average after initial measurement
      layout.isOverridden = true;
      this.averageWindow.addValue(
        this.props.horizontal ? layout.width : layout.height
      );
    }
  }

  public get averageItemSize() {
    return this.averageWindow.currentValue;
  }

  public newLayoutManager(
    renderWindowSize: Dimension,
    isHorizontal?: boolean,
    cachedLayouts?: Layout[]
  ): LayoutManager {
    // Average window is updated whenever a new layout manager is created. This is because old values are not relevant anymore.
    const estimatedItemCount = Math.max(
      3,
      Math.round(
        (this.props.horizontal
          ? renderWindowSize.width
          : renderWindowSize.height) /
          (this.props.estimatedItemSize ?? this.defaultEstimatedItemSize)
      )
    );
    this.averageWindow = new AverageWindow(
      2 * (this.props.numColumns || 1) * estimatedItemCount,
      this.averageWindow.currentValue
    );
    const newLayoutManager = super.newLayoutManager(
      this.getAdjustedRenderWindowSize(renderWindowSize),
      isHorizontal,
      cachedLayouts
    );
    if (cachedLayouts) {
      this.updateCachedDimensions(cachedLayouts, newLayoutManager);
    }
    return newLayoutManager;
  }

  private updateCachedDimensions(
    cachedLayouts: Layout[],
    layoutManager: LayoutManager
  ) {
    const layoutCount = cachedLayouts.length;
    for (let i = 0; i < layoutCount; i++) {
      cachedLayouts[i] = {
        ...cachedLayouts[i],
        // helps in updating the fixed dimension of layouts e.g, width in case of horizontal list
        // updating them in advance will make sure layout manager won't try to fit more items in the same row or column
        ...layoutManager.getStyleOverridesForIndex(i),
      };
    }
  }

  private getCleanLayoutObj() {
    this.layoutObject.size = undefined;
    this.layoutObject.span = undefined;
    return this.layoutObject;
  }

  private getAdjustedRenderWindowSize(renderWindowSize: Dimension) {
    return applyContentContainerInsetForLayoutManager(
      { ...renderWindowSize },
      this.props.contentContainerStyle,
      Boolean(this.props.horizontal)
    );
  }
}
