import React from "react";
import { NativeScrollEvent } from "react-native";
import FlashList from "./FlashList";
import { FlashListProps, ListRenderItemInfo } from "./FlashListProps";
export interface MasonryListRenderItemInfo<TItem> extends ListRenderItemInfo<TItem> {
    columnSpan: number;
    columnIndex: number;
}
export declare type MasonryListRenderItem<TItem> = (info: MasonryListRenderItemInfo<TItem>) => React.ReactElement | null;
export interface MasonryFlashListProps<T> extends Omit<FlashListProps<T>, "horizontal" | "initialScrollIndex" | "inverted" | "onBlankArea" | "renderItem" | "viewabilityConfigCallbackPairs"> {
    /**
     * Allows you to change the column widths of the list. This is helpful if you want some columns to be wider than the others.
     * e.g, if `numColumns` is `3`, you can return `2` for `index 1` and `1` for the rest to achieve a `1:2:1` split by width.
     */
    getColumnFlex?: (items: MasonryListItem<T>[], columnIndex: number, maxColumns: number, extraData?: any) => number;
    /**
     * If enabled, MasonryFlashList will try to reduce difference in column height by modifying item order.
     * `overrideItemLayout` is required to make this work.
     */
    optimizeItemArrangement?: boolean;
    /**
     * Extends typical `renderItem` to include `columnIndex` and `columnSpan` (number of columns the item spans).
     * `columnIndex` gives the consumer column information in case they might need to treat items differently based on column.
     * This information may not otherwise be derived if using the `optimizeItemArrangement` feature, as the items will no
     * longer be linearly distributed across the columns; instead they are allocated to the column with the least estimated height.
     */
    renderItem: MasonryListRenderItem<T> | null | undefined;
}
export interface MasonryFlashListScrollEvent extends NativeScrollEvent {
    doNotPropagate?: boolean;
}
export interface MasonryListItem<T> {
    originalIndex: number;
    originalItem: T;
}
/**
 * MasonryFlashListRef with support for scroll related methods
 */
export interface MasonryFlashListRef<T> {
    scrollToOffset: FlashList<T>["scrollToOffset"];
    scrollToEnd: FlashList<T>["scrollToEnd"];
    getScrollableNode: FlashList<T>["getScrollableNode"];
}
/**
 * FlashList variant that enables rendering of masonry layouts.
 * If you want `MasonryFlashList` to optimize item arrangement, enable `optimizeItemArrangement` and pass a valid `overrideItemLayout` function.
 */
export declare const MasonryFlashList: <T>(props: MasonryFlashListProps<T> & {
    ref?: React.RefObject<MasonryFlashListRef<T>> | undefined;
}) => React.ReactElement;
//# sourceMappingURL=MasonryFlashList.d.ts.map