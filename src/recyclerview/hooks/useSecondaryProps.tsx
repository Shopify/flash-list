import { RefreshControl } from "react-native";
import { RecyclerViewProps } from "../RecyclerViewProps";
import { useMemo } from "react";
import { getValidComponent } from "../utils/componentUtils";
import { CompatView } from "../components/CompatView";
import { CompatScroller } from "../components/CompatScroller";
import React from "react";

export function useSecondaryProps<T>(props: RecyclerViewProps<T>) {
  const {
    ListHeaderComponent,
    ListHeaderComponentStyle,
    ListFooterComponent,
    ListFooterComponentStyle,
    ListEmptyComponent,
    renderScrollComponent,
    refreshing,
    progressViewOffset,
    onRefresh,
    data,
  } = props;
  // Create a function to get the refresh control
  const refreshControl = useMemo(() => {
    if (onRefresh) {
      return (
        <RefreshControl
          refreshing={Boolean(refreshing)}
          progressViewOffset={progressViewOffset}
          onRefresh={onRefresh}
        />
      );
    }
    return undefined;
  }, [onRefresh, refreshing, progressViewOffset]);

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

  const renderEmpty = useMemo(() => {
    if (!ListEmptyComponent || (data && data.length > 0)) {
      return null;
    }
    return getValidComponent(ListEmptyComponent);
  }, [ListEmptyComponent, data]);

  const CompatScrollView = useMemo(
    () =>
      renderScrollComponent
        ? React.forwardRef(
            (props, ref) =>
              renderScrollComponent({ ...props, ref } as any) as any
          )
        : CompatScroller,
    [renderScrollComponent]
  );

  return {
    refreshControl,
    renderHeader,
    renderFooter,
    renderEmpty,
    CompatScrollView,
  };
}
