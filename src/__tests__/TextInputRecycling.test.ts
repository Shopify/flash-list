/**
 * Unit test for GitHub Issue #1980: FlashList TextInput Focus/Text Duplication on Scroll
 * 
 * This test verifies that the RecyclerViewManager generates unique stable IDs
 * for data items even when keyExtractor is not provided.
 */

import { RecyclerViewManager } from "../recyclerview/RecyclerViewManager";
import { RecyclerViewProps } from "../recyclerview/RecyclerViewProps";

describe("RecyclerViewManager - TextInput Recycling Fix", () => {
  it("should generate unique stable IDs for object items without keyExtractor", () => {
    // Create data similar to the bug report - objects without explicit IDs
    const data = Array.from({ length: 40 }, (_, index) => ({
      question: `Question ${index + 1}`,
    }));

    const props: RecyclerViewProps<any> = {
      data,
      renderItem: () => null,
      // keyExtractor is intentionally NOT provided
    };

    const manager = new RecyclerViewManager(props);

    // Get stable IDs for different indices
    const key0 = manager.getDataKey(0);
    const key39 = manager.getDataKey(39);

    // Keys should be different for different items
    expect(key0).not.toBe(key39);

    // Keys should be stable - calling again should return the same key
    expect(manager.getDataKey(0)).toBe(key0);
    expect(manager.getDataKey(39)).toBe(key39);

    // Keys should use the auto-generated format
    expect(key0).toMatch(/^__auto_\d+$/);
    expect(key39).toMatch(/^__auto_\d+$/);
  });

  it("should generate unique stable IDs for the same object at different indices", () => {
    // Create data where the same object appears at different indices
    const sharedObject = { question: "Shared Question" };
    const data = [
      sharedObject,
      { question: "Question 2" },
      sharedObject, // Same object reference
    ];

    const props: RecyclerViewProps<any> = {
      data,
      renderItem: () => null,
    };

    const manager = new RecyclerViewManager(props);

    const key0 = manager.getDataKey(0);
    const key2 = manager.getDataKey(2);

    // Since it's the same object, it should get the same stable ID
    expect(key0).toBe(key2);
  });

  it("should generate unique keys for primitive values at different indices", () => {
    // Test with primitive values
    const data = ["Item 1", "Item 2", "Item 1"]; // "Item 1" appears twice

    const props: RecyclerViewProps<any> = {
      data,
      renderItem: () => null,
    };

    const manager = new RecyclerViewManager(props);

    const key0 = manager.getDataKey(0);
    const key1 = manager.getDataKey(1);
    const key2 = manager.getDataKey(2);

    // For primitives, keys should include the index to ensure uniqueness
    expect(key0).not.toBe(key1);
    expect(key0).not.toBe(key2); // Same value but different index
    expect(key1).not.toBe(key2);

    // Keys should include both the value and index
    expect(key0).toContain("Item 1");
    expect(key0).toContain("0");
    expect(key2).toContain("Item 1");
    expect(key2).toContain("2");
  });

  it("should use keyExtractor when provided", () => {
    const data = [
      { id: "a", question: "Question 1" },
      { id: "b", question: "Question 2" },
    ];

    const props: RecyclerViewProps<any> = {
      data,
      renderItem: () => null,
      keyExtractor: (item) => item.id,
    };

    const manager = new RecyclerViewManager(props);

    const key0 = manager.getDataKey(0);
    const key1 = manager.getDataKey(1);

    // Should use the keyExtractor result
    expect(key0).toBe("a");
    expect(key1).toBe("b");
  });

  it("should maintain stable IDs across multiple calls", () => {
    const data = Array.from({ length: 10 }, (_, index) => ({
      question: `Question ${index + 1}`,
    }));

    const props: RecyclerViewProps<any> = {
      data,
      renderItem: () => null,
    };

    const manager = new RecyclerViewManager(props);

    // Get keys for all items
    const firstPass = data.map((_, index) => manager.getDataKey(index));

    // Get keys again
    const secondPass = data.map((_, index) => manager.getDataKey(index));

    // Keys should be identical across passes
    expect(firstPass).toEqual(secondPass);

    // All keys should be unique
    const uniqueKeys = new Set(firstPass);
    expect(uniqueKeys.size).toBe(data.length);
  });
});
