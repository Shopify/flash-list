"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var CustomError = /** @class */ (function (_super) {
    tslib_1.__extends(CustomError, _super);
    function CustomError(exception) {
        var _this = _super.call(this, "".concat(exception.type, ": ").concat(exception.message)) || this;
        _this.name = exception.type;
        return _this;
    }
    return CustomError;
}(Error));
exports.default = CustomError;
//# sourceMappingURL=CustomError.js.map