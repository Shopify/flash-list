"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roundToDecimalPlaces = void 0;
function roundToDecimalPlaces(value, decimalPlaces) {
    var multiplier = Math.pow(10, decimalPlaces);
    return Math.round(value * multiplier) / multiplier;
}
exports.roundToDecimalPlaces = roundToDecimalPlaces;
//# sourceMappingURL=roundToDecimalPlaces.js.map