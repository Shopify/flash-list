import { valueOrDefault } from "../utils/ValueHelpers";

describe("ValueHelpers", () => {
  it("check for numbers", () => {
    expect(valueOrDefault(null, 0)).toBe(0);
    expect(valueOrDefault(undefined, 0)).toBe(0);
    expect(valueOrDefault(0, 1)).toBe(0);
    expect(valueOrDefault(1, 0)).toBe(1);
  });
  it("check for strings", () => {
    expect(valueOrDefault(null, "default")).toBe("default");
    expect(valueOrDefault(undefined, "default")).toBe("default");
    expect(valueOrDefault("", "default")).toBe("");
    expect(valueOrDefault("test", "default")).toBe("test");
  });
  it("check for boolean", () => {
    expect(valueOrDefault(null, true)).toBe(true);
    expect(valueOrDefault(undefined, true)).toBe(true);
    expect(valueOrDefault(false, true)).toBe(false);
    expect(valueOrDefault(true, false)).toBe(true);
  });
});
