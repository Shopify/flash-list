import React from "react";

export interface WrapperComponentProps {
  extendedState?: object;
  internalSnapshot?: object;
  dataHasChanged: (r1: any, r2: any) => boolean;
  data: any;
}

export default class WrapperComponent extends React.Component<WrapperComponentProps> {
  shouldComponentUpdate(newProps) {
    const hasExtendedStateChanged =
      this.props.extendedState !== newProps.extendedState;
    const hasInternalSnapshotChanged =
      this.props.internalSnapshot !== newProps.internalSnapshot;
    const hasDataChanged =
      this.props.dataHasChanged &&
      this.props.dataHasChanged(this.props.data, newProps.data);
    return (
      hasDataChanged || hasExtendedStateChanged || hasInternalSnapshotChanged
    );
  }

  render() {
    return this.props.children;
  }
}

export interface PureComponentWrapperProps {
  renderer: () => JSX.Element | null;
  [other: string]: unknown;
}

export class PureComponentWrapper extends React.PureComponent<PureComponentWrapperProps> {
  render() {
    return this.props.renderer();
  }
}
