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
  renderer: (arg: unknown) => JSX.Element | null;
  /** Renderer is called with this argument.
   * Don't change this value everytime or else component will always rerender. Prefer primitives. */
  arg?: unknown;
  enabled?: boolean;
  [other: string]: unknown;
}

/**
 * Pure component wrapper that can be used to prevent renders of the `renderer` method passed to the component. Any change in props will lead to `renderer` getting called.
 */
export class PureComponentWrapper extends React.PureComponent<PureComponentWrapperProps> {
  static defaultProps = {
    enabled: true,
  };

  private overrideEnabled: boolean | undefined = undefined;

  /** Once set explicitly prop will be ignored. Not using state becasue of performance reasons. */
  public setEnabled(enabled: boolean) {
    if (enabled !== this.overrideEnabled) {
      this.overrideEnabled = enabled;
      this.forceUpdate();
    }
  }

  render() {
    if (this.overrideEnabled === undefined) {
      return (
        (this.props.enabled && this.props.renderer(this.props.arg)) || null
      );
    } else {
      return (
        (this.overrideEnabled && this.props.renderer(this.props.arg)) || null
      );
    }
  }
}
