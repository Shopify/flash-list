import React, { useEffect } from "react";

import AutoLayoutViewNativeComponent, {
  OnBlankAreaEvent,
} from "./AutoLayoutViewNativeComponent";

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
  onBlankAreaEvent: BlankAreaEventHandler;
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
    listeners.forEach((listener) => {
      listener(blankEventValue);
    });
    if (this.props.onBlankAreaEvent) {
      this.props.onBlankAreaEvent(blankEventValue);
    }
  };

  render() {
    return (
      <AutoLayoutViewNativeComponent
        {...this.props}
        onBlankAreaEvent={this.onBlankAreaEventCallback}
        enableInstrumentation={
          listeners.length !== 0 || Boolean(this.props.onBlankAreaEvent)
        }
      >
        {this.props.children}
      </AutoLayoutViewNativeComponent>
    );
  }
}

export default AutoLayoutView;
