import { Animated, RefreshControl } from "react-native";
import React, { useMemo } from "react";

import { RecyclerViewProps } from "../RecyclerViewProps";
import { getValidComponent } from "../utils/componentUtils";
import { CompatView } from "../components/CompatView";
import { CompatAnimatedScroller } from "../components/CompatScroller";

/**
 * Hook that manages secondary props and components for the RecyclerView.
 * This hook handles the creation and management of:
 * 1. Pull-to-refresh functionality
 * 2. Header and footer components
 * 3. Empty state component
 * 4. Loading state component
 * 5. Custom scroll component with animation support
 *
 * @param props - The RecyclerViewProps containing all configuration options
 * @returns An object containing:
 *   - refreshControl: The pull-to-refresh control component
 *   - renderHeader: The header component renderer
 *   - renderFooter: The footer component renderer
 *   - renderEmpty: The empty state component renderer
 *   - renderLoading: The loading state component renderer
 *   - renderStickyHeaderBackdrop: The sticky header backdrop component renderer
 *   - CompatScrollView: The animated scroll component
 */
export function useSecondaryProps<T>(props: RecyclerViewProps<T>) {
  const {
    ListHeaderComponent,
    ListHeaderComponentStyle,
    ListFooterComponent,
    ListFooterComponentStyle,
    ListEmptyComponent,
    LoadingComponent,
    isLoading,
    renderScrollComponent,
    refreshing,
    progressViewOffset,
    onRefresh,
    data,
    refreshControl: customRefreshControl,
    stickyHeaderConfig,
  } = props;

  /**
   * Creates the refresh control component if onRefresh is provided.
   */
  const refreshControl = useMemo(() => {
    if (customRefreshControl) {
      return customRefreshControl;
    } else if (onRefresh) {
      return (
        <RefreshControl
          refreshing={Boolean(refreshing)}
          progressViewOffset={progressViewOffset}
          onRefresh={onRefresh}
        />
      );
    }
    return undefined;
  }, [onRefresh, refreshing, progressViewOffset, customRefreshControl]);

  /**
   * Creates the header component with optional styling.
   */
  const renderHeader = useMemo(() => {
    if (!ListHeaderComponent) {
      return null;
    }
    return (
      <CompatView style={ListHeaderComponentStyle}>
        {getValidComponent(ListHeaderComponent)}
      </CompatView>
    );
  }, [ListHeaderComponent, ListHeaderComponentStyle]);

  /**
   * Creates the footer component with optional styling.
   */
  const renderFooter = useMemo(() => {
    if (!ListFooterComponent) {
      return null;
    }
    return (
      <CompatView style={ListFooterComponentStyle}>
        {getValidComponent(ListFooterComponent)}
      </CompatView>
    );
  }, [ListFooterComponent, ListFooterComponentStyle]);

  /**
   * Creates the loading state component when data is being fetched.
   * Only rendered when LoadingComponent is provided and isLoading is true.
   * Takes precedence over the empty state component.
   */
  const renderLoading = useMemo(() => {
    if (!LoadingComponent || !isLoading) {
      return null;
    }
    return getValidComponent(LoadingComponent);
  }, [LoadingComponent, isLoading]);

  /**
   * Creates the empty state component when there's no data.
   * Only rendered when ListEmptyComponent is provided, data is empty, and not loading.
   */
  const renderEmpty = useMemo(() => {
    // Don't show empty component if we're loading
    if (isLoading) {
      return null;
    }
    if (!ListEmptyComponent || (data && data.length > 0)) {
      return null;
    }
    return getValidComponent(ListEmptyComponent);
  }, [ListEmptyComponent, data, isLoading]);

  /**
   * Creates the sticky header backdrop component.
   */
  const renderStickyHeaderBackdrop = useMemo(() => {
    if (!stickyHeaderConfig?.backdropComponent) {
      return null;
    }
    return (
      <CompatView
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      >
        {getValidComponent(stickyHeaderConfig?.backdropComponent)}
      </CompatView>
    );
  }, [stickyHeaderConfig?.backdropComponent]);

  /**
   * Creates an animated scroll component based on the provided renderScrollComponent.
   * If no custom component is provided, uses the default CompatAnimatedScroller.
   */
  const CompatScrollView = useMemo(() => {
    let scrollComponent = CompatAnimatedScroller;
    if (typeof renderScrollComponent === "function") {
      // Create a forwarded ref wrapper for the custom scroll component
      const ForwardedScrollComponent = React.forwardRef((_props, ref) =>
        (renderScrollComponent as any)({ ..._props, ref } as any)
      );
      ForwardedScrollComponent.displayName = "CustomScrollView";
      scrollComponent = ForwardedScrollComponent as any;
    } else if (renderScrollComponent) {
      scrollComponent = renderScrollComponent;
    }
    // Wrap the scroll component with Animated.createAnimatedComponent
    return Animated.createAnimatedComponent(scrollComponent);
  }, [renderScrollComponent]);

  return {
    refreshControl,
    renderHeader,
    renderFooter,
    renderEmpty,
    renderLoading,
    CompatScrollView,
    renderStickyHeaderBackdrop,
  };
}
