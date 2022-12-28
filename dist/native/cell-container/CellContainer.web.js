"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importDefault(require("react"));
/**
 * On web we use a view instead of cell container till we build native web implementations
 */
var CellContainer = react_1.default.forwardRef(function (props, ref) {
    return react_1.default.createElement("div", tslib_1.__assign({ ref: ref }, props));
});
CellContainer.displayName = "CellContainer";
exports.default = CellContainer;
//# sourceMappingURL=CellContainer.web.js.map