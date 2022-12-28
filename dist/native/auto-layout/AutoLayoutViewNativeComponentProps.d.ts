import { ReactNode } from "react";
export interface OnBlankAreaEvent {
    nativeEvent: {
        offsetStart: number;
        offsetEnd: number;
    };
}
declare type OnBlankAreaEventHandler = (event: OnBlankAreaEvent) => void;
export interface AutoLayoutViewNativeComponentProps {
    children?: ReactNode;
    onBlankAreaEvent: OnBlankAreaEventHandler;
    enableInstrumentation: boolean;
    disableAutoLayout?: boolean;
}
export {};
//# sourceMappingURL=AutoLayoutViewNativeComponentProps.d.ts.map