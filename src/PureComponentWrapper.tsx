import React from "react";

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

  /** Once set explicitly, prop will be ignored. Not using state because of performance reasons. */
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
