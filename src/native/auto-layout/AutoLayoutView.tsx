import React, { useEffect, ReactNode } from "react";
import { LayoutChangeEvent } from "react-native";

import AutoLayoutViewNativeComponent from "./AutoLayoutViewNativeComponent";
import { OnBlankAreaEvent } from "./AutoLayoutViewNativeComponentProps";

export type BlankAreaEventHandler = (blankAreaEvent: BlankAreaEvent) => void;
const listeners: BlankAreaEventHandler[] = [];

export const useOnNativeBlankAreaEvents = (
  onBlankAreaEvent: (blankAreaEvent: BlankAreaEvent) => void
) => {
  useEffect(() => {
    listeners.push(onBlankAreaEvent);
    return () => {
      listeners.filter((callback) => callback !== onBlankAreaEvent);
    };
  }, [onBlankAreaEvent]);
};

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

class AutoLayoutView extends React.Component<AutoLayoutViewProps> {
  private onBlankAreaEventCallback = ({
    nativeEvent,
  }: OnBlankAreaEvent): void => {
    const blankArea = Math.max(nativeEvent.offsetStart, nativeEvent.offsetEnd);
    const blankEventValue = {
      blankArea,
      offsetStart: nativeEvent.offsetStart,
      offsetEnd: nativeEvent.offsetEnd,
    };
    this.broadcastBlankEvent(blankEventValue);
    if (this.props.onBlankAreaEvent) {
      this.props.onBlankAreaEvent(blankEventValue);
    }
  };

  private broadcastBlankEvent(value: BlankAreaEvent) {
    const len = listeners.length;
    for (let i = 0; i < len; i++) {
      listeners[i](value);
    }
  }

  render() {
    return (
      <AutoLayoutViewNativeComponent
        {...this.props}
        onBlankAreaEvent={this.onBlankAreaEventCallback}
        enableInstrumentation={
          listeners.length !== 0 || Boolean(this.props.onBlankAreaEvent)
        }
        disableAutoLayout={this.props.disableAutoLayout}
      >
        {this.props.children}
      </AutoLayoutViewNativeComponent>
    );
  }
}

export default AutoLayoutView;
