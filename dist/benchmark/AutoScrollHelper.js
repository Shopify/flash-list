"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cancellable = exports.autoScroll = void 0;
/**
 * This method can be used to trigger scroll events that can be forwarded to an element. Anything that implements scrollable can leverage this.
 * @param scroll The scrollable element
 * @param fromX The x offset to start from
 * @param fromY The y offset to start from
 * @param toX the x offset to end scroll at
 * @param toY the y offset to end scroll at
 * @param speedMultiplier  the speed multiplier to use
 * @param cancellable can be used to cancel the scroll
 * @returns Promise that resolves when the scroll is complete
 */
function autoScroll(scroll, fromX, fromY, toX, toY, speedMultiplier, cancellable) {
    if (speedMultiplier === void 0) { speedMultiplier = 1; }
    if (cancellable === void 0) { cancellable = new Cancellable(); }
    return new Promise(function (resolve) {
        scroll(fromX, fromY, false);
        // Very fast scrolls on Android/iOS typically move content 7px every millisecond.
        var incrementPerMs = 7 * speedMultiplier;
        var directionMultiplierX = toX > fromX ? 1 : -1;
        var directionMultiplierY = toY > fromY ? 1 : -1;
        var comparatorX = toX > fromX ? Math.min : Math.max;
        var comparatorY = toY > fromY ? Math.min : Math.max;
        var startTime = Date.now();
        var startX = fromX;
        var startY = fromY;
        // Computes the number of pixels to scroll in the given time
        // Also invokes the scrollable to update the scroll position
        var animationLoop = function () {
            requestAnimationFrame(function () {
                if (cancellable.isCancelled()) {
                    resolve(false);
                    return;
                }
                var currentTime = Date.now();
                var timeElapsed = currentTime - startTime;
                var distanceToCover = incrementPerMs * timeElapsed;
                startX += distanceToCover * directionMultiplierX;
                startY += distanceToCover * directionMultiplierY;
                scroll(comparatorX(toX, startX), comparatorY(toY, startY), false);
                startTime = currentTime;
                if (comparatorX(toX, startX) !== toX ||
                    comparatorY(toY, startY) !== toY) {
                    return animationLoop();
                }
                resolve(true);
            });
        };
        animationLoop();
    });
}
exports.autoScroll = autoScroll;
var Cancellable = /** @class */ (function () {
    function Cancellable() {
        this._isCancelled = false;
    }
    Cancellable.prototype.cancel = function () {
        this._isCancelled = true;
    };
    Cancellable.prototype.isCancelled = function () {
        return this._isCancelled;
    };
    return Cancellable;
}());
exports.Cancellable = Cancellable;
//# sourceMappingURL=AutoScrollHelper.js.map