import React from "react";
import "@quilted/react-testing/matchers";
import { Root } from "@quilted/react-testing";
import { ListRenderItem } from "../../FlashListProps";
import { MasonryFlashListProps, MasonryFlashListRef } from "../../MasonryFlashList";
export declare type MockMasonryFlashListProps = Omit<MasonryFlashListProps<string>, "estimatedItemSize" | "data" | "renderItem"> & {
    estimatedItemSize?: number;
    data?: string[];
    renderItem?: ListRenderItem<string>;
};
/**
 * Helper to mount MasonryFlashList for testing.
 */
export declare const mountMasonryFlashList: (props?: MockMasonryFlashListProps, ref?: React.RefObject<MasonryFlashListRef<string>>) => Omit<Root<MasonryFlashListProps<string>, import("@quilted/react-testing").EmptyObject, import("@quilted/react-testing").EmptyObject, import("@quilted/react-testing").EmptyObject>, "instance"> & {
    instance: MasonryFlashListRef<string>;
};
export declare function renderMasonryFlashList(props?: MockMasonryFlashListProps, ref?: React.RefObject<MasonryFlashListRef<string>>): JSX.Element;
//# sourceMappingURL=mountMasonryFlashList.d.ts.map