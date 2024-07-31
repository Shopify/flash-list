import { LayoutChangeEvent, View, ViewStyle } from "react-native";
import React, { RefObject, useCallback, useLayoutEffect, useRef } from "react";

import { RVLayout } from "./LayoutManager";

export interface ViewHolderProps {
  index: number;
  layout: RVLayout;
  style?: ViewStyle;
  refHolder: Map<number, RefObject<View | null>>;
  children?: React.ReactNode;
  onSizeChanged?: (index: number) => void;
}
export const ViewHolder = (props: ViewHolderProps) => {
  // create ref for View
  const viewRef = useRef<View>(null);
  const { index, refHolder, style, layout, onSizeChanged } = props;

  useLayoutEffect(() => {
    refHolder.set(index, viewRef);
    return () => {
      if (refHolder.get(index) === viewRef) {
        refHolder.delete(index);
      }
    };
  }, [index, refHolder]);

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      // height width don't match layot call
      if (
        layout.height !== event.nativeEvent.layout.height ||
        layout.width !== event.nativeEvent.layout.width
      ) {
        onSizeChanged?.(index);
      }
    },
    [index, layout.height, layout.width, onSizeChanged]
  );

  console.log("ViewHolder re-render", index);

  return (
    <View
      ref={viewRef}
      onLayout={onLayout}
      style={{
        ...style,
        position: "absolute",
        width: layout.enforcedWidth ? layout.width : undefined,
        height: layout.enforcedHeight ? layout.height : undefined,
        minHeight: layout.minHeight,
        minWidth: layout.minWidth,
        maxHeight: layout.maxHeight,
        maxWidth: layout.maxWidth,
        transform: [{ translateX: layout.x }, { translateY: layout.y }],
      }}
    >
      {props.children}
    </View>
  );
};
