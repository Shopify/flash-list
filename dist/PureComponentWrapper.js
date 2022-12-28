"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PureComponentWrapper = void 0;
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importDefault(require("react"));
/**
 * Pure component wrapper that can be used to prevent renders of the `renderer` method passed to the component. Any change in props will lead to `renderer` getting called.
 */
var PureComponentWrapper = /** @class */ (function (_super) {
    tslib_1.__extends(PureComponentWrapper, _super);
    function PureComponentWrapper() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.overrideEnabled = undefined;
        return _this;
    }
    /** Once set explicitly, prop will be ignored. Not using state because of performance reasons. */
    PureComponentWrapper.prototype.setEnabled = function (enabled) {
        if (enabled !== this.overrideEnabled) {
            this.overrideEnabled = enabled;
            this.forceUpdate();
        }
    };
    PureComponentWrapper.prototype.render = function () {
        if (this.overrideEnabled === undefined) {
            return ((this.props.enabled && this.props.renderer(this.props.arg)) || null);
        }
        else {
            return ((this.overrideEnabled && this.props.renderer(this.props.arg)) || null);
        }
    };
    PureComponentWrapper.defaultProps = {
        enabled: true,
    };
    return PureComponentWrapper;
}(react_1.default.PureComponent));
exports.PureComponentWrapper = PureComponentWrapper;
//# sourceMappingURL=PureComponentWrapper.js.map