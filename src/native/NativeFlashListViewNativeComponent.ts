/**
 * Native component spec for NativeFlashListView.
 *
 * This is the JS-side declaration of the native RecyclerView-backed component.
 * It uses requireNativeComponent for the bridge between JS and native.
 */
import {
  requireNativeComponent,
  type ViewProps,
  type NativeSyntheticEvent,
} from "react-native";
import type React from "react";

export interface NativeScrollEventData {
  contentOffset: number;
  contentSize: number;
  viewportSize: number;
  horizontal: boolean;
}

export interface NativeRenderRequestData {
  indices: number[];
  sync: boolean;
}

export interface NativeViewableItemsChangedData {
  viewableItems: Array<{
    index: number;
    isViewable: boolean;
    key: string;
  }>;
  changed: Array<{
    index: number;
    isViewable: boolean;
    key: string;
  }>;
}

export interface NativeFlashListViewProps extends ViewProps {
  // Layout
  horizontal?: boolean;
  inverted?: boolean;
  numColumns?: number;
  masonry?: boolean;
  itemCount?: number;
  drawDistance?: number;

  // Scroll behavior
  scrollEnabled?: boolean;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  bounces?: boolean;
  overScrollMode?: string;
  nestedScrollEnabled?: boolean;
  pagingEnabled?: boolean;
  snapToInterval?: number;
  snapToAlignment?: string;
  decelerationRate?: number;
  scrollEventThrottle?: number;
  keyboardDismissMode?: string;

  // Thresholds
  onEndReachedThreshold?: number;
  onStartReachedThreshold?: number;

  // Refresh
  refreshing?: boolean;
  onRefreshEnabled?: boolean;
  progressViewOffset?: number;

  // Content insets
  contentInsetTop?: number;
  contentInsetBottom?: number;
  contentInsetLeft?: number;
  contentInsetRight?: number;

  // Item metadata (maps index -> type/key/span)
  itemTypes?: Record<string, string>;
  itemKeys?: Record<string, string>;
  spanSizes?: Record<string, number>;

  // Sticky headers
  stickyHeaderIndices?: number[];

  // Maintain visible content position
  maintainVisibleContentPosition?: {
    disabled?: boolean;
    autoscrollToTopThreshold?: number;
    autoscrollToBottomThreshold?: number;
  };

  // Scroll events
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEventData>) => void;
  onScrollBeginDrag?: (
    event: NativeSyntheticEvent<NativeScrollEventData>
  ) => void;
  onMomentumScrollBegin?: (
    event: NativeSyntheticEvent<NativeScrollEventData>
  ) => void;
  onMomentumScrollEnd?: (
    event: NativeSyntheticEvent<NativeScrollEventData>
  ) => void;

  // List events
  onEndReached?: (event: NativeSyntheticEvent<{}>) => void;
  onStartReached?: (event: NativeSyntheticEvent<{}>) => void;
  onRefresh?: (event: NativeSyntheticEvent<{}>) => void;
  onRenderRequest?: (
    event: NativeSyntheticEvent<NativeRenderRequestData>
  ) => void;
  onViewableItemsChanged?: (
    event: NativeSyntheticEvent<NativeViewableItemsChangedData>
  ) => void;

  children?: React.ReactNode;
}

/**
 * The native component backed by RecyclerView (Android) / UICollectionView (iOS).
 */
const NativeFlashListView =
  requireNativeComponent<NativeFlashListViewProps>("NativeFlashListView");

export default NativeFlashListView;
