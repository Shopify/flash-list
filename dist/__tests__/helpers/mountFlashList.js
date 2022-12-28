"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderFlashList = exports.mountFlashList = void 0;
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importDefault(require("react"));
var react_native_1 = require("react-native");
require("@quilted/react-testing/matchers");
var react_testing_1 = require("@quilted/react-testing");
var FlashList_1 = tslib_1.__importDefault(require("../../FlashList"));
jest.mock("../../FlashList", function () {
    var ActualFlashList = jest.requireActual("../../FlashList").default;
    var MockFlashList = /** @class */ (function (_super) {
        tslib_1.__extends(MockFlashList, _super);
        function MockFlashList() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MockFlashList.prototype.componentDidMount = function () {
            var _a, _b, _c;
            _super.prototype.componentDidMount.call(this);
            (_c = (_b = (_a = this.rlvRef) === null || _a === void 0 ? void 0 : _a._scrollComponent) === null || _b === void 0 ? void 0 : _b._scrollViewRef) === null || _c === void 0 ? void 0 : _c.props.onLayout({
                nativeEvent: { layout: { height: 900, width: 400 } },
            });
        };
        return MockFlashList;
    }(ActualFlashList));
    return MockFlashList;
});
/**
 * Helper to mount FlashList for testing.
 */
var mountFlashList = function (props, ref) {
    var flashList = (0, react_testing_1.mount)(renderFlashList(props, ref));
    return flashList;
};
exports.mountFlashList = mountFlashList;
function renderFlashList(props, ref) {
    var _a;
    return (react_1.default.createElement(FlashList_1.default, tslib_1.__assign({}, props, { ref: ref, renderItem: (props === null || props === void 0 ? void 0 : props.renderItem) || (function (_a) {
            var item = _a.item;
            return react_1.default.createElement(react_native_1.Text, null, item);
        }), estimatedItemSize: (_a = props === null || props === void 0 ? void 0 : props.estimatedItemSize) !== null && _a !== void 0 ? _a : ((props === null || props === void 0 ? void 0 : props.disableDefaultEstimatedItemSize) ? undefined : 200), data: (props === null || props === void 0 ? void 0 : props.data) || ["One", "Two", "Three", "Four"] })));
}
exports.renderFlashList = renderFlashList;
//# sourceMappingURL=mountFlashList.js.map