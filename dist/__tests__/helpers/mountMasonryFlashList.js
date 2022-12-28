"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderMasonryFlashList = exports.mountMasonryFlashList = void 0;
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importDefault(require("react"));
var react_native_1 = require("react-native");
require("@quilted/react-testing/matchers");
var react_testing_1 = require("@quilted/react-testing");
var MasonryFlashList_1 = require("../../MasonryFlashList");
jest.mock("../../FlashList", function () {
    var ActualFlashList = jest.requireActual("../../FlashList").default;
    var MockFlashList = /** @class */ (function (_super) {
        tslib_1.__extends(MockFlashList, _super);
        function MockFlashList() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MockFlashList.prototype.componentDidMount = function () {
            var _a, _b, _c, _d, _e, _f, _g;
            _super.prototype.componentDidMount.call(this);
            (_c = (_b = (_a = this.rlvRef) === null || _a === void 0 ? void 0 : _a._scrollComponent) === null || _b === void 0 ? void 0 : _b._scrollViewRef) === null || _c === void 0 ? void 0 : _c.props.onLayout({
                nativeEvent: {
                    layout: {
                        height: (_e = (_d = this.props.estimatedListSize) === null || _d === void 0 ? void 0 : _d.height) !== null && _e !== void 0 ? _e : 900,
                        width: (_g = (_f = this.props.estimatedListSize) === null || _f === void 0 ? void 0 : _f.width) !== null && _g !== void 0 ? _g : 400,
                    },
                },
            });
        };
        return MockFlashList;
    }(ActualFlashList));
    return MockFlashList;
});
/**
 * Helper to mount MasonryFlashList for testing.
 */
var mountMasonryFlashList = function (props, ref) {
    var flashList = (0, react_testing_1.mount)(renderMasonryFlashList(props, ref));
    return flashList;
};
exports.mountMasonryFlashList = mountMasonryFlashList;
function renderMasonryFlashList(props, ref) {
    var _a, _b;
    return (react_1.default.createElement(MasonryFlashList_1.MasonryFlashList, tslib_1.__assign({}, props, { ref: ref, numColumns: (_a = props === null || props === void 0 ? void 0 : props.numColumns) !== null && _a !== void 0 ? _a : 2, renderItem: (props === null || props === void 0 ? void 0 : props.renderItem) || (function (_a) {
            var item = _a.item;
            return react_1.default.createElement(react_native_1.Text, null, item);
        }), estimatedItemSize: (_b = props === null || props === void 0 ? void 0 : props.estimatedItemSize) !== null && _b !== void 0 ? _b : 200, data: (props === null || props === void 0 ? void 0 : props.data) || ["One", "Two", "Three", "Four"] })));
}
exports.renderMasonryFlashList = renderMasonryFlashList;
//# sourceMappingURL=mountMasonryFlashList.js.map