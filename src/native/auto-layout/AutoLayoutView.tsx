import React, { useEffect, ReactNode } from "react";
import { LayoutChangeEvent } from "react-native";

import AutoLayoutViewNativeComponent from "./AutoLayoutViewNativeComponent";
import {
  OnBlankAreaEvent,
  OnAutoLayoutEvent,
} from "./AutoLayoutViewNativeComponentProps";

export type BlankAreaEventHandler = (blankAreaEvent: BlankAreaEvent) => void;
export type OnAutoLayoutHandler = (rawEvent: OnAutoLayoutEvent) => void;
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
  onAutoLayout?: OnAutoLayoutHandler;
  onLayout?: (event: LayoutChangeEvent) => void;
  innerRef?: any;
  disableAutoLayout?: boolean;
  enableAutoLayoutInfo?: boolean;
  autoLayoutId?: number;
  preservedIndex?: number;
}

class AutoLayoutView extends React.Component<AutoLayoutViewProps> {
  private _renderId: number = 0x00000000;

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
    if (!this.props.disableAutoLayout &&
      this.props.preservedIndex !== undefined &&
      this.props.preservedIndex > -1) {
      this._renderId = (this._renderId + 1) & 0xFFFFFFFF;
    }

    return (
      <AutoLayoutViewNativeComponent
        {...this.props}
        ref={this.props.innerRef}
        onBlankAreaEvent={this.onBlankAreaEventCallback}
        enableInstrumentation={
          listeners.length !== 0 || Boolean(this.props.onBlankAreaEvent)
        }
        autoLayoutId={this.props.autoLayoutId}
        onAutoLayout={this.props.onAutoLayout || (() => {})}
        enableAutoLayoutInfo={Boolean(this.props.onAutoLayout)}
        disableAutoLayout={this.props.disableAutoLayout}
        preservedIndex={this.props.preservedIndex}
	renderId={this._renderId}
      >
        {this.props.children}
      </AutoLayoutViewNativeComponent>
    );
  }
}

export default AutoLayoutView;
