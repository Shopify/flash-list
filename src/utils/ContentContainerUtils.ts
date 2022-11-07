import { ViewStyle } from "react-native";
import { Dimension } from "recyclerlistview";

import { ContentStyle } from "../FlashListProps";

export interface ContentStyleExplicit {
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  backgroundColor?: string;
}

export const updateContentStyle = (
  contentStyle: ContentStyle,
  contentContainerStyleSource: ContentStyle | undefined
): ContentStyleExplicit => {
  const {
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    padding,
    paddingVertical,
    paddingHorizontal,
    backgroundColor,
  } = (contentContainerStyleSource ?? {}) as ViewStyle;
  contentStyle.paddingLeft = Number(
    paddingLeft || paddingHorizontal || padding || 0
  );
  contentStyle.paddingRight = Number(
    paddingRight || paddingHorizontal || padding || 0
  );
  contentStyle.paddingTop = Number(
    paddingTop || paddingVertical || padding || 0
  );
  contentStyle.paddingBottom = Number(
    paddingBottom || paddingVertical || padding || 0
  );
  contentStyle.backgroundColor = backgroundColor;
  return contentStyle as ContentStyleExplicit;
};

export const hasUnsupportedKeysInContentContainerStyle = (
  contentContainerStyleSource: ViewStyle | undefined
) => {
  const {
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    padding,
    paddingVertical,
    paddingHorizontal,
    backgroundColor,
    ...rest
  } = (contentContainerStyleSource ?? {}) as ViewStyle;
  return Object.keys(rest).length > 0;
};

/** Applies padding corrections to given dimension. Mutates the dim object that was passed and returns it. */
export const applyContentContainerInsetForLayoutManager = (
  dim: Dimension,
  contentContainerStyle: ViewStyle | undefined,
  horizontal: boolean | undefined | null
) => {
  const contentStyle = updateContentStyle({}, contentContainerStyle);
  if (horizontal) {
    dim.height -= contentStyle.paddingTop + contentStyle.paddingBottom;
  } else {
    dim.width -= contentStyle.paddingLeft + contentStyle.paddingRight;
  }
  return dim;
};

/** Returns padding to be applied on content container and will ignore paddings that have already been handled. */
export const getContentContainerPadding = (
  contentStyle: ContentStyleExplicit,
  horizontal: boolean | undefined | null
) => {
  if (horizontal) {
    return {
      paddingTop: contentStyle.paddingTop,
      paddingBottom: contentStyle.paddingBottom,
    };
  } else {
    return {
      paddingLeft: contentStyle.paddingLeft,
      paddingRight: contentStyle.paddingRight,
    };
  }
};
