export interface OnBlankAreaEvent {
  nativeEvent: {
    offsetStart: number;
    offsetEnd: number;
  };
}

type OnBlankAreaEventHandler = (event: OnBlankAreaEvent) => void;

export interface AutoLayoutViewNativeComponentProps {
  onBlankAreaEvent: OnBlankAreaEventHandler;
  enableInstrumentation: boolean;
  disableAutoLayout?: boolean;
}
