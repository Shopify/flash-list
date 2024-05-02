import { ReactNode } from "react";

export interface OnBlankAreaEvent {
  nativeEvent: {
    offsetStart: number;
    offsetEnd: number;
  };
}
export interface OnAutoLayoutEvent {
  nativeEvent: {
    layouts: {
      key: number;
      height: number;
      y: number;
    }[];
    autoLayoutId: number;
  };
}

type OnBlankAreaEventHandler = (event: OnBlankAreaEvent) => void;
type OnAutoLayoutHandler = (rawEvent: OnAutoLayoutEvent) => void;

export interface AutoLayoutViewNativeComponentProps {
  children?: ReactNode;
  onBlankAreaEvent: OnBlankAreaEventHandler;
  onAutoLayout: OnAutoLayoutHandler;
  enableInstrumentation: boolean;
  enableAutoLayoutInfo?: boolean;
  disableAutoLayout?: boolean;
  autoLayoutId?: number;
  preservedIndex?: number;
  renderId?: number;
}
