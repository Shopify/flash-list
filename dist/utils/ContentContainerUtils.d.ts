import { ViewStyle } from "react-native";
import { Dimension } from "recyclerlistview";
import { ContentStyle } from "../FlashListProps";
export interface ContentStyleExplicit {
    paddingTop: number;
    paddingBottom: number;
    paddingLeft: number;
    paddingRight: number;
    backgroundColor?: string;
    flexGrow?: number;
}
export declare const updateContentStyle: (contentStyle: ContentStyle, contentContainerStyleSource: ContentStyle | undefined) => ContentStyleExplicit;
export declare const hasUnsupportedKeysInContentContainerStyle: (contentContainerStyleSource: ViewStyle | undefined) => boolean;
/** Applies padding corrections to given dimension. Mutates the dim object that was passed and returns it. */
export declare const applyContentContainerInsetForLayoutManager: (dim: Dimension, contentContainerStyle: ViewStyle | undefined, horizontal: boolean | undefined | null) => Dimension;
/** Returns padding to be applied on content container and will ignore paddings that have already been handled. */
export declare const getContentContainerPadding: (contentStyle: ContentStyleExplicit, horizontal: boolean | undefined | null) => {
    paddingTop: number;
    paddingBottom: number;
    paddingLeft?: undefined;
    paddingRight?: undefined;
} | {
    paddingLeft: number;
    paddingRight: number;
    paddingTop?: undefined;
    paddingBottom?: undefined;
};
//# sourceMappingURL=ContentContainerUtils.d.ts.map