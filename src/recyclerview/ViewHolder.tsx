import { View, ViewStyle } from "react-native";
import React, { RefObject, useLayoutEffect, useRef } from "react";

import { RVLayout } from "./LayoutManager";

export interface ViewHolderProps {
  index: number;
  layout: RVLayout;
  style?: ViewStyle;
  refHolder: Map<number, RefObject<View | null>>;
  children?: React.ReactNode;
}
export const ViewHolder = (props: ViewHolderProps) => {
  // create ref for View
  const viewRef = useRef<View>(null);
  const { index, refHolder, style, layout } = props;

  useLayoutEffect(() => {
    refHolder.set(index, viewRef);
    return () => {
      if (refHolder.get(index) === viewRef) {
        refHolder.delete(index);
      }
    };
  }, [index, refHolder]);
  return (
    <View
      ref={viewRef}
      style={{
        ...style,
        position: "absolute",
        width: layout.width,
        transform: [{ translateX: layout.x }, { translateY: layout.y }],
      }}
    >
      {props.children}
    </View>
  );
};
