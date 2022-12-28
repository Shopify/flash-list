import React from "react";
import { DataProvider, RecyclerListView, RecyclerListViewProps } from "recyclerlistview";
import GridLayoutProviderWithProps from "./GridLayoutProviderWithProps";
import { FlashListProps } from "./FlashListProps";
export interface FlashListState<T> {
    dataProvider: DataProvider;
    numColumns: number;
    layoutProvider: GridLayoutProviderWithProps<T>;
    data?: ReadonlyArray<T> | null;
    extraData?: ExtraData<unknown>;
    renderItem?: FlashListProps<T>["renderItem"];
}
interface ExtraData<T> {
    value?: T;
}
declare class FlashList<T> extends React.PureComponent<FlashListProps<T>, FlashListState<T>> {
    private rlvRef?;
    private stickyContentContainerRef?;
    private listFixedDimensionSize;
    private transformStyle;
    private transformStyleHorizontal;
    private distanceFromWindow;
    private contentStyle;
    private loadStartTime;
    private isListLoaded;
    private windowCorrectionConfig;
    private postLoadTimeoutId?;
    private sizeWarningTimeoutId?;
    private isEmptyList;
    private viewabilityManager;
    private itemAnimator?;
    static defaultProps: {
        data: never[];
        numColumns: number;
    };
    constructor(props: FlashListProps<T>);
    private validateProps;
    static getDerivedStateFromProps<T>(nextProps: Readonly<FlashListProps<T>>, prevState: FlashListState<T>): FlashListState<T>;
    private static getInitialMutableState;
    private static getLayoutProvider;
    private onEndReached;
    private getRefreshControl;
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): JSX.Element;
    private onScrollBeginDrag;
    private onScroll;
    private getUpdatedWindowCorrectionConfig;
    private isInitialScrollIndexInFirstRow;
    private validateListSize;
    private handleSizeChange;
    private container;
    private itemContainer;
    private updateDistanceFromWindow;
    private getTransform;
    private separator;
    private header;
    private footer;
    private getComponentForHeightMeasurement;
    private getValidComponent;
    private applyWindowCorrection;
    private rowRendererSticky;
    private rowRendererWithIndex;
    /**
     * This will prevent render item calls unless data changes.
     * Output of this method is received as children object so returning null here is no issue as long as we handle it inside our child container.
     * @module getCellContainerChild acts as the new rowRenderer and is called directly from our child container.
     */
    private emptyRowRenderer;
    private getCellContainerChild;
    private recyclerRef;
    private stickyContentRef;
    private stickyOverrideRowRenderer;
    private get isStickyEnabled();
    private onItemLayout;
    private raiseOnLoadEventIfNeeded;
    private runAfterOnLoad;
    private clearPostLoadTimeout;
    /**
     * Disables recycling for the next frame so that layout animations run well.
     * Warning: Avoid this when making large changes to the data as the list might draw too much to run animations. Single item insertions/deletions
     * should be good. With recycling paused the list cannot do much optimization.
     * The next render will run as normal and reuse items.
     */
    prepareForLayoutAnimationRender(): void;
    scrollToEnd(params?: {
        animated?: boolean | null | undefined;
    }): void;
    scrollToIndex(params: {
        animated?: boolean | null | undefined;
        index: number;
        viewOffset?: number | undefined;
        viewPosition?: number | undefined;
    }): void;
    scrollToItem(params: {
        animated?: boolean | null | undefined;
        item: any;
        viewPosition?: number | undefined;
        viewOffset?: number | undefined;
    }): void;
    scrollToOffset(params: {
        animated?: boolean | null | undefined;
        offset: number;
    }): void;
    getScrollableNode(): number | null;
    /**
     * Allows access to internal recyclerlistview. This is useful for enabling access to its public APIs.
     * Warning: We may swap recyclerlistview for something else in the future. Use with caution.
     */
    get recyclerlistview_unsafe(): RecyclerListView<RecyclerListViewProps, any> | undefined;
    /**
     * Specifies how far the first item is from top of the list. This would normally be a sum of header size and top/left padding applied to the list.
     */
    get firstItemOffset(): number;
    /**
     * Tells the list an interaction has occurred, which should trigger viewability calculations, e.g. if waitForInteractions is true and the user has not scrolled.
     * This is typically called by taps on items or by navigation actions.
     */
    recordInteraction: () => void;
}
export default FlashList;
//# sourceMappingURL=FlashList.d.ts.map