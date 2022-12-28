"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AverageWindow_1 = require("../utils/AverageWindow");
describe("AverageWindow", function () {
    var fillAverageWindow = function (averageWindow, from, to) {
        for (var i = from; i < to; i++) {
            averageWindow.addValue(i);
        }
    };
    it("all input window values should be filled with correct values", function () {
        var commonValue = 50;
        var size = 100;
        var averageWindow = new AverageWindow_1.AverageWindow(size);
        var inputValues = averageWindow["inputValues"];
        for (var i = 0; i < size; i++) {
            averageWindow.addValue(commonValue);
        }
        expect(Math.round(averageWindow.currentValue)).toBe(commonValue);
        expect(inputValues.every(function (val) { return val === commonValue; })).toBe(true);
    });
    it("computes correct average", function () {
        // We're gonna check if average from internal array matches the current average value
        var size = 100;
        var averageWindow = new AverageWindow_1.AverageWindow(size);
        var inputValues = averageWindow["inputValues"];
        fillAverageWindow(averageWindow, 0, 200);
        // calculate average directly
        var reduceObj = inputValues.reduce(function (obj, val) {
            if (val !== undefined) {
                obj.sum += val;
                obj.count++;
            }
            return obj;
        }, { sum: 0, count: 0 });
        // running average could be different by few decimal points so floor is required
        expect(Math.floor(averageWindow.currentValue)).toBe(Math.floor(reduceObj.sum / reduceObj.count));
    });
    it("should prioritize new values quickly", function () {
        var size = 30;
        var averageWindow = new AverageWindow_1.AverageWindow(size);
        fillAverageWindow(averageWindow, 0, 100);
        expect(averageWindow.currentValue).toBeGreaterThan(70);
        fillAverageWindow(averageWindow, 0, 30);
        expect(averageWindow.currentValue).toBeLessThan(30);
    });
    it("reports initial average correctly", function () {
        var size = 30;
        var averageWindow = new AverageWindow_1.AverageWindow(size, 25);
        expect(averageWindow.currentValue).toBe(25);
    });
    it("updates initial average correctly", function () {
        var size = 30;
        var averageWindow = new AverageWindow_1.AverageWindow(size, 10);
        averageWindow.addValue(20);
        expect(averageWindow.currentValue).toBe(15);
    });
    it("increments next index correctly", function () {
        var size = 30;
        var averageWindow = new AverageWindow_1.AverageWindow(size);
        for (var i = 0; i < 300; i++) {
            expect(averageWindow["getNextIndex"]()).toBe(i % size);
        }
        var averageWindow2 = new AverageWindow_1.AverageWindow(size, 1);
        for (var i = 1; i < 300; i++) {
            expect(averageWindow2["getNextIndex"]()).toBe(i % size);
        }
    });
});
//# sourceMappingURL=AverageWindow.test.js.map