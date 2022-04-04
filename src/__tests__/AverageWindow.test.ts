import { AverageWindow } from "../utils/AverageWindow";

class AverageWindowTest extends AverageWindow {
  public get storedValues(): (number | undefined)[] {
    return super.getStoredValues();
  }
  public getRandomNumber(min: number, max: number): number {
    return super.getRandomNumber(min, max);
  }
}

describe("AverageWindow", () => {
  it("all input window values should be filled with correct values", () => {
    const commonValue = 50;
    const averageWindow = new AverageWindowTest(10);
    const inputValues = averageWindow.storedValues;

    // Over a large number of iterations, all input values should always be filled
    while (inputValues.indexOf(undefined) !== -1) {
      averageWindow.addValue(commonValue);
    }
    expect(Math.floor(averageWindow.currentValue)).toBe(commonValue);
    expect(inputValues.every((val) => val === commonValue)).toBe(true);
  });
  it("computes correct average", () => {
    // We're gonna check if average from internal array matched the current value which is computed in constant time after addValue is called
    const size = 100;
    const averageWindow = new AverageWindowTest(size);
    const inputValues = averageWindow.storedValues;
    for (let i = 0; i < 200; i++) {
      averageWindow.addValue(averageWindow.getRandomNumber(0, i));
    }
    const reduceObj = inputValues.reduce(
      (obj, val) => {
        if (val !== undefined) {
          obj.sum += val;
          obj.count++;
        }
        return obj;
      },
      { sum: 0, count: 0 }
    );
    console.log(averageWindow.currentValue);
    console.log(reduceObj.sum / reduceObj.count);
    expect(Math.floor(averageWindow.currentValue)).toBe(
      Math.floor(reduceObj.sum / reduceObj.count)
    );
  });
  it("should prioritize new values quickly", () => {
    const size = 10;
    const averageWindow = new AverageWindowTest(size);
    for (let i = 0; i < 100; i++) {
      averageWindow.addValue(i);
    }
    expect(averageWindow.currentValue).toBeGreaterThan(50);
    console.log(averageWindow);
    for (let i = 0; i < 20; i++) {
      averageWindow.addValue(averageWindow.getRandomNumber(1, 10));
    }
    console.log(averageWindow);
    expect(averageWindow.currentValue).toBeLessThan(30);
  });
  it("random number generator includes boundaries", () => {
    const averageWindow = new AverageWindowTest(10);
    let val = 0;
    while (val !== 5) {
      val = averageWindow.getRandomNumber(1, 5);
    }
    expect(val).toBe(5);
    while (val !== 10) {
      val = averageWindow.getRandomNumber(10, 15);
    }
    expect(val).toBe(10);
  });
});
