import { AverageWindow, MultiTypeAverageWindow } from "../utils/AverageWindow";

describe("AverageWindow", () => {
  const fillAverageWindow = (
    averageWindow: AverageWindow,
    from: number,
    to: number
  ) => {
    for (let i = from; i < to; i++) {
      averageWindow.addValue(i);
    }
  };
  it("all input window values should be filled with correct values", () => {
    const commonValue = 50;
    const size = 100;
    const averageWindow = new AverageWindow(size);
    const inputValues = averageWindow["inputValues"];

    for (let i = 0; i < size; i++) {
      averageWindow.addValue(commonValue);
    }
    expect(Math.round(averageWindow.currentValue)).toBe(commonValue);
    expect(inputValues.every((val) => val === commonValue)).toBe(true);
  });
  it("computes correct average", () => {
    // We're gonna check if average from internal array matches the current average value
    const size = 100;
    const averageWindow = new AverageWindow(size);
    const inputValues = averageWindow["inputValues"];
    fillAverageWindow(averageWindow, 0, 200);

    // calculate average directly
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

    // running average could be different by few decimal points so floor is required
    expect(Math.floor(averageWindow.currentValue)).toBe(
      Math.floor(reduceObj.sum / reduceObj.count)
    );
  });
  it("should prioritize new values quickly", () => {
    const size = 30;
    const averageWindow = new AverageWindow(size);
    fillAverageWindow(averageWindow, 0, 100);
    expect(averageWindow.currentValue).toBeGreaterThan(70);

    fillAverageWindow(averageWindow, 0, 30);
    expect(averageWindow.currentValue).toBeLessThan(30);
  });
  it("reports initial average correctly", () => {
    const size = 30;
    const averageWindow = new AverageWindow(size, 25);
    expect(averageWindow.currentValue).toBe(25);
  });
  it("updates initial average correctly", () => {
    const size = 30;
    const averageWindow = new AverageWindow(size, 10);
    averageWindow.addValue(20);
    expect(averageWindow.currentValue).toBe(15);
  });
  it("increments next index correctly", () => {
    const size = 30;
    const averageWindow = new AverageWindow(size);
    for (let i = 0; i < 300; i++) {
      expect(averageWindow["getNextIndex"]()).toBe(i % size);
    }
    const averageWindow2 = new AverageWindow(size, 1);
    for (let i = 1; i < 300; i++) {
      expect(averageWindow2["getNextIndex"]()).toBe(i % size);
    }
  });
});

describe("MultiTypeAverageWindow", () => {
  it("should maintain separate averages for different types", () => {
    const windowSize = 10;
    const multiTypeAverageWindow = new MultiTypeAverageWindow(windowSize);

    multiTypeAverageWindow.addValue(10, "type1");
    multiTypeAverageWindow.addValue(20, "type2");

    expect(multiTypeAverageWindow.getCurrentValue("type1")).toBe(10);
    expect(multiTypeAverageWindow.getCurrentValue("type2")).toBe(20);
  });

  it("should update averages correctly for each type", () => {
    const windowSize = 5;
    const multiTypeAverageWindow = new MultiTypeAverageWindow(windowSize);

    multiTypeAverageWindow.addValue(10, "type1");
    multiTypeAverageWindow.addValue(20, "type1");
    multiTypeAverageWindow.addValue(30, "type1");

    multiTypeAverageWindow.addValue(5, "type2");
    multiTypeAverageWindow.addValue(15, "type2");

    expect(multiTypeAverageWindow.getCurrentValue("type1")).toBe(20);
    expect(multiTypeAverageWindow.getCurrentValue("type2")).toBe(10);
  });

  it("should return 0 for non-existent types", () => {
    const windowSize = 5;
    const multiTypeAverageWindow = new MultiTypeAverageWindow(windowSize);

    expect(multiTypeAverageWindow.getCurrentValue("nonExistentType")).toBe(0);
  });

  it("should reset all averages", () => {
    const windowSize = 5;
    const multiTypeAverageWindow = new MultiTypeAverageWindow(windowSize);

    multiTypeAverageWindow.addValue(10, "type1");
    multiTypeAverageWindow.addValue(20, "type2");

    multiTypeAverageWindow.reset();

    expect(multiTypeAverageWindow.getCurrentValue("type1")).toBe(0);
    expect(multiTypeAverageWindow.getCurrentValue("type2")).toBe(0);
  });
});
