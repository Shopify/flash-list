import React, { ReactNode } from "react";
import { LayoutChangeEvent } from "react-native";
export declare type BlankAreaEventHandler = (blankAreaEvent: BlankAreaEvent) => void;
export declare const useOnNativeBlankAreaEvents: (onBlankAreaEvent: (blankAreaEvent: BlankAreaEvent) => void) => void;
export interface BlankAreaEvent {
    offsetStart: number;
    offsetEnd: number;
    blankArea: number;
}
export interface AutoLayoutViewProps {
    children?: ReactNode;
    onBlankAreaEvent?: BlankAreaEventHandler;
    onLayout?: (event: LayoutChangeEvent) => void;
    disableAutoLayout?: boolean;
}
declare class AutoLayoutView extends React.Component<AutoLayoutViewProps> {
    private onBlankAreaEventCallback;
    private broadcastBlankEvent;
    render(): JSX.Element;
}
export default AutoLayoutView;
//# sourceMappingURL=AutoLayoutView.d.ts.map