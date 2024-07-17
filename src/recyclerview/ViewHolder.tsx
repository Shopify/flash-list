import { View, ViewStyle } from "react-native";
import React, { RefObject, useLayoutEffect, useRef } from "react";

import { RVLayout } from "./LayoutManager";

export interface ViewHolderProps {
  index: number;
  reactKey: string;
  layout: RVLayout;
  style?: ViewStyle;
  refHolder: Map<number, RefObject<View | null>>;
  children?: React.ReactNode;
}
export const ViewHolder = (props: ViewHolderProps) => {
  // create ref for View
  const viewRef = useRef<View>(null);
  const { index, refHolder, reactKey, style, layout } = props;

  useLayoutEffect(() => {
    refHolder.set(index, viewRef);
    return () => {
      if (refHolder.get(index) === viewRef) {
        refHolder.delete(index);
      }
    };
  }, [index, refHolder]);
  console.log("ViewHolder layout", layout);
  return (
    <View
      ref={viewRef}
      key={reactKey}
      style={{
        ...style,
        position: "absolute",
        transform: [{ translateX: layout.x }, { translateY: layout.y }],
      }}
    >
      {props.children}
    </View>
  );
};
