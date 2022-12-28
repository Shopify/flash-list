import { Dimension, GridLayoutProvider, Layout, LayoutManager } from "recyclerlistview";
import { FlashListProps } from "./FlashListProps";
export default class GridLayoutProviderWithProps<T> extends GridLayoutProvider {
    private props;
    private layoutObject;
    private averageWindow;
    private renderWindowInsets;
    private _hasExpired;
    defaultEstimatedItemSize: number;
    constructor(maxSpan: number, getLayoutType: (index: number, props: FlashListProps<T>, mutableLayout: {
        span?: number;
        size?: number;
    }) => string | number, getSpan: (index: number, props: FlashListProps<T>, mutableLayout: {
        span?: number;
        size?: number;
    }) => number, getHeightOrWidth: (index: number, props: FlashListProps<T>, mutableLayout: {
        span?: number;
        size?: number;
    }) => number | undefined, props: FlashListProps<T>, acceptableRelayoutDelta?: number);
    updateProps(props: FlashListProps<T>): GridLayoutProviderWithProps<T>;
    /**
     * This methods returns true if the layout provider has expired and needs to be recreated.
     * This can happen if the number of columns has changed or the render window size has changed in a way that cannot be handled by the layout provider internally.
     */
    get hasExpired(): boolean;
    /**
     * Calling this method will help the layout provider track average item sizes on its own
     * Overriding layout manager can help achieve the same thing without relying on this method being called however, it will make implementation very complex for a simple use case
     * @param index Index of the item being reported
     */
    reportItemLayout(index: number): void;
    get averageItemSize(): number;
    newLayoutManager(renderWindowSize: Dimension, isHorizontal?: boolean, cachedLayouts?: Layout[]): LayoutManager;
    private updateCachedDimensions;
    private getCleanLayoutObj;
    private getAdjustedRenderWindowSize;
}
//# sourceMappingURL=GridLayoutProviderWithProps.d.ts.map