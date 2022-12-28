"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AverageWindow = void 0;
/**
 * Helper class to calculate running average of the most recent n values
 */
var AverageWindow = /** @class */ (function () {
    function AverageWindow(size, startValue) {
        this.nextIndex = 0;
        this.inputValues = new Array(Math.max(1, size));
        this.currentAverage = startValue !== null && startValue !== void 0 ? startValue : 0;
        this.currentCount = startValue === undefined ? 0 : 1;
        this.nextIndex = this.currentCount;
        this.inputValues[0] = startValue;
    }
    Object.defineProperty(AverageWindow.prototype, "currentValue", {
        /**
         * Can be used to get the current average value
         */
        get: function () {
            return this.currentAverage;
        },
        enumerable: false,
        configurable: true
    });
    /**
     *
     * @param value Add new value to the average window and updated current average
     */
    AverageWindow.prototype.addValue = function (value) {
        var target = this.getNextIndex();
        var oldValue = this.inputValues[target];
        var newCount = oldValue === undefined ? this.currentCount + 1 : this.currentCount;
        this.inputValues[target] = value;
        this.currentAverage =
            this.currentAverage * (this.currentCount / newCount) +
                (value - (oldValue !== null && oldValue !== void 0 ? oldValue : 0)) / newCount;
        this.currentCount = newCount;
    };
    AverageWindow.prototype.getNextIndex = function () {
        // starts from 0 once we reach end of the array
        var newTarget = this.nextIndex;
        this.nextIndex = (this.nextIndex + 1) % this.inputValues.length;
        return newTarget;
    };
    return AverageWindow;
}());
exports.AverageWindow = AverageWindow;
//# sourceMappingURL=AverageWindow.js.map