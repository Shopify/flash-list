/* eslint-disable id-length */
import { ConsecutiveNumbers } from "../recyclerview/helpers/ConsecutiveNumbers";

describe("ConsecutiveNumbers", () => {
  describe("constructor", () => {
    it("should initialize with start and end indices", () => {
      const numbers = new ConsecutiveNumbers(5, 10);
      expect(numbers.startIndex).toBe(5);
      expect(numbers.endIndex).toBe(10);
    });
  });

  describe("EMPTY", () => {
    it("should have correct values for EMPTY constant", () => {
      expect(ConsecutiveNumbers.EMPTY.startIndex).toBe(-1);
      expect(ConsecutiveNumbers.EMPTY.endIndex).toBe(-2);
      expect(ConsecutiveNumbers.EMPTY.length).toBe(0);
    });
  });

  describe("length", () => {
    it("should return correct length for valid range", () => {
      expect(new ConsecutiveNumbers(5, 10).length).toBe(6);
      expect(new ConsecutiveNumbers(0, 0).length).toBe(1);
    });

    it("should return 0 for invalid range", () => {
      expect(new ConsecutiveNumbers(5, 4).length).toBe(0);
      expect(new ConsecutiveNumbers(10, 5).length).toBe(0);
    });
  });

  describe("at", () => {
    it("should return correct value at index", () => {
      const numbers = new ConsecutiveNumbers(5, 10);
      expect(numbers.at(0)).toBe(5);
      expect(numbers.at(3)).toBe(8);
      expect(numbers.at(5)).toBe(10);
    });

    it("should work with negative ranges", () => {
      const numbers = new ConsecutiveNumbers(-3, 2);
      expect(numbers.at(0)).toBe(-3);
      expect(numbers.at(3)).toBe(0);
      expect(numbers.at(5)).toBe(2);
    });
  });

  describe("equals", () => {
    it("should return true for identical ranges", () => {
      const a = new ConsecutiveNumbers(5, 10);
      const b = new ConsecutiveNumbers(5, 10);
      expect(a.equals(b)).toBe(true);
    });

    it("should return false for different ranges", () => {
      const a = new ConsecutiveNumbers(5, 10);
      const b = new ConsecutiveNumbers(5, 11);
      const c = new ConsecutiveNumbers(6, 10);
      expect(a.equals(b)).toBe(false);
      expect(a.equals(c)).toBe(false);
    });

    it("should handle empty ranges", () => {
      expect(ConsecutiveNumbers.EMPTY.equals(ConsecutiveNumbers.EMPTY)).toBe(
        true
      );
      expect(
        ConsecutiveNumbers.EMPTY.equals(new ConsecutiveNumbers(1, 5))
      ).toBe(false);
    });
  });

  describe("toArray", () => {
    it("should return correct array for valid range", () => {
      expect(new ConsecutiveNumbers(5, 8).toArray()).toEqual([5, 6, 7, 8]);
      expect(new ConsecutiveNumbers(0, 3).toArray()).toEqual([0, 1, 2, 3]);
      expect(new ConsecutiveNumbers(-2, 1).toArray()).toEqual([-2, -1, 0, 1]);
    });

    it("should return empty array for invalid ranges", () => {
      expect(new ConsecutiveNumbers(5, 4).toArray()).toEqual([]);
      expect(ConsecutiveNumbers.EMPTY.toArray()).toEqual([]);
    });
  });

  describe("includes", () => {
    it("should return true for values in range", () => {
      const numbers = new ConsecutiveNumbers(5, 10);
      expect(numbers.includes(5)).toBe(true);
      expect(numbers.includes(7)).toBe(true);
      expect(numbers.includes(10)).toBe(true);
    });

    it("should return false for values outside range", () => {
      const numbers = new ConsecutiveNumbers(5, 10);
      expect(numbers.includes(4)).toBe(false);
      expect(numbers.includes(11)).toBe(false);
    });

    it("should handle empty ranges", () => {
      expect(ConsecutiveNumbers.EMPTY.includes(0)).toBe(false);
    });
  });

  describe("indexOf", () => {
    it("should return correct index for values in range", () => {
      const numbers = new ConsecutiveNumbers(5, 10);
      expect(numbers.indexOf(5)).toBe(0);
      expect(numbers.indexOf(7)).toBe(2);
      expect(numbers.indexOf(10)).toBe(5);
    });

    it("should return -1 for values outside range", () => {
      const numbers = new ConsecutiveNumbers(5, 10);
      expect(numbers.indexOf(4)).toBe(-1);
      expect(numbers.indexOf(11)).toBe(-1);
    });
  });

  describe("findValue", () => {
    it("should find values matching predicate", () => {
      const numbers = new ConsecutiveNumbers(5, 10);
      expect(numbers.findValue((v) => v % 2 === 0)).toBe(6);
      expect(numbers.findValue((v) => v > 8)).toBe(9);
    });

    it("should return undefined when no match found", () => {
      const numbers = new ConsecutiveNumbers(5, 10);
      expect(numbers.findValue((v) => v > 100)).toBe(undefined);
    });

    it("should provide index and array to predicate", () => {
      const numbers = new ConsecutiveNumbers(5, 7);
      const mockFn = jest.fn().mockReturnValue(false);
      numbers.findValue(mockFn);
      expect(mockFn).toHaveBeenCalledTimes(3);
      expect(mockFn).toHaveBeenNthCalledWith(1, 5, 0, numbers);
      expect(mockFn).toHaveBeenNthCalledWith(2, 6, 1, numbers);
      expect(mockFn).toHaveBeenNthCalledWith(3, 7, 2, numbers);
    });
  });

  describe("every", () => {
    it("should return true when all values match predicate", () => {
      const numbers = new ConsecutiveNumbers(5, 10);
      expect(numbers.every((v) => v >= 5)).toBe(true);
      expect(numbers.every((v) => v <= 10)).toBe(true);
    });

    it("should return false when some values do not match predicate", () => {
      const numbers = new ConsecutiveNumbers(5, 10);
      expect(numbers.every((v) => v % 2 === 0)).toBe(false);
      expect(numbers.every((v) => v > 7)).toBe(false);
    });

    it("should provide index and array to predicate", () => {
      const numbers = new ConsecutiveNumbers(5, 7);
      const mockFn = jest.fn().mockReturnValue(true);
      numbers.every(mockFn);
      expect(mockFn).toHaveBeenCalledTimes(3);
      expect(mockFn).toHaveBeenNthCalledWith(1, 5, 0, numbers);
      expect(mockFn).toHaveBeenNthCalledWith(2, 6, 1, numbers);
      expect(mockFn).toHaveBeenNthCalledWith(3, 7, 2, numbers);
    });

    it("should short-circuit when predicate returns false", () => {
      const numbers = new ConsecutiveNumbers(5, 10);
      const mockFn = jest.fn().mockImplementation((v) => v < 7);
      numbers.every(mockFn);
      expect(mockFn).toHaveBeenCalledTimes(3); // Should stop after v=7
    });
  });

  describe("slice", () => {
    it("should slice with both start and end", () => {
      const numbers = new ConsecutiveNumbers(5, 10);
      const sliced = numbers.slice(1, 4);
      expect(sliced.startIndex).toBe(6);
      expect(sliced.endIndex).toBe(8);
      expect(sliced.length).toBe(3);
    });

    it("should slice with only start", () => {
      const numbers = new ConsecutiveNumbers(5, 10);
      const sliced = numbers.slice(2);
      expect(sliced.startIndex).toBe(7);
      expect(sliced.endIndex).toBe(10);
      expect(sliced.length).toBe(4);
    });

    it("should handle out of bounds slices", () => {
      const numbers = new ConsecutiveNumbers(5, 10);
      const sliced = numbers.slice(0, 100);
      expect(sliced.length).toBe(6);
      expect(sliced.startIndex).toBe(5);
      expect(sliced.endIndex).toBe(10);
    });

    it("should handle invalid slices", () => {
      const numbers = new ConsecutiveNumbers(5, 10);
      const sliced = numbers.slice(4, 3);
      expect(sliced.length).toBe(0);
      expect(sliced.startIndex).toBe(9);
      expect(sliced.endIndex).toBe(8);
    });
  });

  describe("iterator", () => {
    it("should iterate over all values", () => {
      const numbers = new ConsecutiveNumbers(5, 8);
      const result = [];
      for (const num of numbers) {
        result.push(num);
      }
      expect(result).toEqual([5, 6, 7, 8]);
    });

    it("should handle empty ranges", () => {
      const result = [];
      for (const num of ConsecutiveNumbers.EMPTY) {
        result.push(num);
      }
      expect(result).toEqual([]);
    });

    it("should work with spread operator", () => {
      const numbers = new ConsecutiveNumbers(5, 8);
      expect([...numbers]).toEqual([5, 6, 7, 8]);
    });
  });
});
