import { ReactNode } from "react";

export interface OnBlankAreaEvent {
  nativeEvent: {
    offsetStart: number;
    offsetEnd: number;
  };
}

type OnBlankAreaEventHandler = (event: OnBlankAreaEvent) => void;

export interface AutoLayoutViewNativeComponentProps {
  children?: ReactNode;
  onBlankAreaEvent: OnBlankAreaEventHandler;
  enableInstrumentation: boolean;
  disableAutoLayout?: boolean;
  experimentalScrollPositionManagement?: boolean;
}
