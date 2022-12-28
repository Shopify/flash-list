"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSFPSMonitor = void 0;
var roundToDecimalPlaces_1 = require("./roundToDecimalPlaces");
/**
 * Can be used to monitor JS thread performance
 * Use startTracking() and stopAndGetData() to start and stop tracking
 */
var JSFPSMonitor = /** @class */ (function () {
    function JSFPSMonitor() {
        var _this = this;
        this.startTime = 0;
        this.frameCount = 0;
        this.timeWindow = {
            frameCount: 0,
            startTime: 0,
        };
        this.minFPS = Number.MAX_SAFE_INTEGER;
        this.maxFPS = 0;
        this.averageFPS = 0;
        this.clearAnimationNumber = 0;
        this.updateLoopCompute = function () {
            _this.frameCount++;
            var elapsedTime = (Date.now() - _this.startTime) / 1000;
            _this.averageFPS = elapsedTime > 0 ? _this.frameCount / elapsedTime : 0;
            _this.timeWindow.frameCount++;
            var timeWindowElapsedTime = (Date.now() - _this.timeWindow.startTime) / 1000;
            if (timeWindowElapsedTime >= 1) {
                var timeWindowAverageFPS = _this.timeWindow.frameCount / timeWindowElapsedTime;
                _this.minFPS = Math.min(_this.minFPS, timeWindowAverageFPS);
                _this.maxFPS = Math.max(_this.maxFPS, timeWindowAverageFPS);
                _this.timeWindow.frameCount = 0;
                _this.timeWindow.startTime = Date.now();
            }
            _this.measureLoop();
        };
    }
    JSFPSMonitor.prototype.measureLoop = function () {
        // This looks weird but I'm avoiding a new closure
        this.clearAnimationNumber = requestAnimationFrame(this.updateLoopCompute);
    };
    JSFPSMonitor.prototype.startTracking = function () {
        if (this.startTime !== 0) {
            throw new Error("This FPS Monitor has already been run, please create a new instance");
        }
        this.startTime = Date.now();
        this.timeWindow.startTime = Date.now();
        this.measureLoop();
    };
    JSFPSMonitor.prototype.stopAndGetData = function () {
        cancelAnimationFrame(this.clearAnimationNumber);
        if (this.minFPS === Number.MAX_SAFE_INTEGER) {
            this.minFPS = this.averageFPS;
            this.maxFPS = this.averageFPS;
        }
        return {
            minFPS: (0, roundToDecimalPlaces_1.roundToDecimalPlaces)(this.minFPS, 1),
            maxFPS: (0, roundToDecimalPlaces_1.roundToDecimalPlaces)(this.maxFPS, 1),
            averageFPS: (0, roundToDecimalPlaces_1.roundToDecimalPlaces)(this.averageFPS, 1),
        };
    };
    return JSFPSMonitor;
}());
exports.JSFPSMonitor = JSFPSMonitor;
//# sourceMappingURL=JSFPSMonitor.js.map