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
export declare class PureComponentWrapper extends React.PureComponent<PureComponentWrapperProps> {
    static defaultProps: {
        enabled: boolean;
    };
    private overrideEnabled;
    /** Once set explicitly, prop will be ignored. Not using state because of performance reasons. */
    setEnabled(enabled: boolean): void;
    render(): JSX.Element | null;
}
//# sourceMappingURL=PureComponentWrapper.d.ts.map