import React from "react";
import "@quilted/react-testing/matchers";
import { Root } from "@quilted/react-testing";
import FlashList from "../../FlashList";
import { FlashListProps, ListRenderItem } from "../../FlashListProps";
export declare type MockFlashListProps = Omit<FlashListProps<string>, "estimatedItemSize" | "data" | "renderItem"> & {
    estimatedItemSize?: number;
    data?: string[];
    renderItem?: ListRenderItem<string>;
    disableDefaultEstimatedItemSize?: boolean;
};
/**
 * Helper to mount FlashList for testing.
 */
export declare const mountFlashList: (props?: MockFlashListProps, ref?: React.RefObject<FlashList<string>>) => Omit<Root<FlashListProps<string>, import("@quilted/react-testing").EmptyObject, import("@quilted/react-testing").EmptyObject, import("@quilted/react-testing").EmptyObject>, "instance"> & {
    instance: FlashList<string>;
};
export declare function renderFlashList(props?: MockFlashListProps, ref?: React.RefObject<FlashList<string>>): JSX.Element;
//# sourceMappingURL=mountFlashList.d.ts.map