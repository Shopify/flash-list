"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useOnNativeBlankAreaEvents = void 0;
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importStar(require("react"));
var AutoLayoutViewNativeComponent_1 = tslib_1.__importDefault(require("./AutoLayoutViewNativeComponent"));
var listeners = [];
var useOnNativeBlankAreaEvents = function (onBlankAreaEvent) {
    (0, react_1.useEffect)(function () {
        listeners.push(onBlankAreaEvent);
        return function () {
            listeners.filter(function (callback) { return callback !== onBlankAreaEvent; });
        };
    }, [onBlankAreaEvent]);
};
exports.useOnNativeBlankAreaEvents = useOnNativeBlankAreaEvents;
var AutoLayoutView = /** @class */ (function (_super) {
    tslib_1.__extends(AutoLayoutView, _super);
    function AutoLayoutView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onBlankAreaEventCallback = function (_a) {
            var nativeEvent = _a.nativeEvent;
            var blankArea = Math.max(nativeEvent.offsetStart, nativeEvent.offsetEnd);
            var blankEventValue = {
                blankArea: blankArea,
                offsetStart: nativeEvent.offsetStart,
                offsetEnd: nativeEvent.offsetEnd,
            };
            _this.broadcastBlankEvent(blankEventValue);
            if (_this.props.onBlankAreaEvent) {
                _this.props.onBlankAreaEvent(blankEventValue);
            }
        };
        return _this;
    }
    AutoLayoutView.prototype.broadcastBlankEvent = function (value) {
        var len = listeners.length;
        for (var i = 0; i < len; i++) {
            listeners[i](value);
        }
    };
    AutoLayoutView.prototype.render = function () {
        return (react_1.default.createElement(AutoLayoutViewNativeComponent_1.default, tslib_1.__assign({}, this.props, { onBlankAreaEvent: this.onBlankAreaEventCallback, enableInstrumentation: listeners.length !== 0 || Boolean(this.props.onBlankAreaEvent), disableAutoLayout: this.props.disableAutoLayout }), this.props.children));
    };
    return AutoLayoutView;
}(react_1.default.Component));
exports.default = AutoLayoutView;
//# sourceMappingURL=AutoLayoutView.js.map