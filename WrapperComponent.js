import React from "react"

export default class WrapperComponent extends React.Component {
    shouldComponentUpdate(newProps) {
        const hasExtendedStateChanged = this.props.extendedState !== newProps.extendedState;
        const hasInternalSnapshotChanged = this.props.internalSnapshot !== newProps.internalSnapshot;
        const hasDataChanged = (this.props.dataHasChanged && this.props.dataHasChanged(this.props.data, newProps.data));
        return hasDataChanged || hasExtendedStateChanged || hasInternalSnapshotChanged;
    }
    render() {
        return this.props.children;
    }
}