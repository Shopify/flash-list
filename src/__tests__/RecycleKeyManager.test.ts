import { RecycleKeyManagerImpl } from "../recyclerview/RecycleKeyManager";

describe("RecycleKeyManagerImpl", () => {
  let keyManager: RecycleKeyManagerImpl;

  beforeEach(() => {
    // Initialize a new manager before each test
    keyManager = new RecycleKeyManagerImpl();
  });

  describe("constructor", () => {
    it("should initialize with default maxItems", () => {
      // Test default maxItems value (implicitly tested via other methods)
      // We can potentially expose maxItems for testing or test its effect
      expect(keyManager).toBeDefined(); // Basic check
    });

    it("should initialize with specified maxItems", () => {
      const specificMaxItems = 10;
      keyManager = new RecycleKeyManagerImpl(specificMaxItems);
      // Test the effect of maxItems limit later in getKey tests
      expect(keyManager).toBeDefined(); // Basic check
    });
  });

  describe("getKey", () => {
    it("should generate a new key for a new item type without stableId", () => {
      const key = keyManager.getKey("typeA", "item1");
      expect(key).toBeDefined();
      expect(typeof key).toBe("string");
      expect(keyManager.hasKeyInPool(key)).toBe(false);
    });

    it("should generate a different key for a different item type", () => {
      const keyA = keyManager.getKey("typeA", "item1");
      const keyB = keyManager.getKey("typeB", "item2");
      expect(keyA).not.toEqual(keyB);
      expect(keyManager.hasKeyInPool(keyA)).toBe(false);
      expect(keyManager.hasKeyInPool(keyB)).toBe(false);
    });

    it("should generate sequential keys when pool is empty", () => {
      const key1 = keyManager.getKey("typeA", "item1");
      const key2 = keyManager.getKey("typeA", "item2");
      expect(parseInt(key2, 10)).toBe(parseInt(key1, 10) + 1);
    });

    it("should return the existing key for a known stableId", () => {
      const stableId = "stable1";
      const key1 = keyManager.getKey("typeA", stableId);
      const key2 = keyManager.getKey("typeA", stableId);
      const key3 = keyManager.getKey("typeB", stableId); // Different type, same stableId
      expect(key2).toEqual(key1);
      expect(key3).toEqual(key1); // Should still return the key associated with the stableId
      expect(keyManager.hasKeyInPool(key1)).toBe(false);
    });

    it("should reuse a key from the pool for the same item type", () => {
      const key1 = keyManager.getKey("typeA", "item1");
      keyManager.recycleKey(key1);
      const key2 = keyManager.getKey("typeA", "item2");
      expect(key2).toEqual(key1); // Should reuse the recycled key
      expect(keyManager.hasKeyInPool(key1)).toBe(false);
    });

    it("should reuse the specified currentKey if it exists in the pool", () => {
      const key1 = keyManager.getKey("typeA", "item1");
      const key2 = keyManager.getKey("typeA", "item2");
      keyManager.recycleKey(key1);
      keyManager.recycleKey(key2);

      const reusedKey = keyManager.getKey("typeA", "item3", key1);
      expect(reusedKey).toEqual(key1);
      expect(keyManager.hasKeyInPool(key1)).toBe(false);
      // key2 should still be in the pool
      expect(keyManager.hasKeyInPool(key2)).toBe(true);
    });

    it("should reuse any key from the pool if currentKey does not exist", () => {
      const key1 = keyManager.getKey("typeA", "item1");
      const key2 = keyManager.getKey("typeA", "item2");
      keyManager.recycleKey(key1);
      keyManager.recycleKey(key2);

      const nonExistentKey = "nonExistentKey";
      const reusedKey = keyManager.getKey("typeA", "item3", nonExistentKey);

      // It should have reused either key1 or key2
      expect([key1, key2]).toContain(reusedKey);
      expect(keyManager.hasKeyInPool(reusedKey)).toBe(false);
    });

    it("should prioritize stableId over pool reuse", () => {
      const stableId = "stable1";
      const key1 = keyManager.getKey("typeA", stableId); // Assign key1 to stable1
      const key2 = keyManager.getKey("typeA", "item2");
      keyManager.recycleKey(key2); // Put key2 in the pool

      // Request key for stable1 again
      const key3 = keyManager.getKey("typeA", stableId);
      expect(key3).toEqual(key1); // Should return key1 associated with stableId
      expect(keyManager.hasKeyInPool(key1)).toBe(false);
      // key2 should still be in the pool
      expect(keyManager.hasKeyInPool(key2)).toBe(true);
    });

    it("should assign stableId to a reused key", () => {
      const key1 = keyManager.getKey("typeA", "item1");
      keyManager.recycleKey(key1);

      const stableId = "stableReuse";
      const reusedKey = keyManager.getKey("typeA", stableId); // Reuse key1 and assign stableId
      expect(reusedKey).toEqual(key1);

      // Verify stableId mapping
      const keyForStableId = keyManager.getKey("typeA", stableId);
      expect(keyForStableId).toEqual(key1);
    });

    it("should handle ensurePoolSize when maxItems is exceeded", () => {
      const maxItems = 2;
      keyManager = new RecycleKeyManagerImpl(maxItems);

      const key1 = keyManager.getKey("typeA", "item1"); // Active: {key1}
      const key2 = keyManager.getKey("typeA", "item2"); // Active: {key1, key2}
      expect(keyManager.hasKeyInPool(key1)).toBe(false);
      expect(keyManager.hasKeyInPool(key2)).toBe(false);

      // This should trigger ensurePoolSize and recycle key1 (oldest)
      const key3 = keyManager.getKey("typeA", "item3"); // Active: {key2, key3}

      expect(keyManager.hasKeyInPool(key1)).toBe(true); // key1 should be recycled
      expect(keyManager.hasKeyInPool(key2)).toBe(false);
      expect(keyManager.hasKeyInPool(key3)).toBe(false);

      // This should trigger ensurePoolSize and recycle key2
      const key4 = keyManager.getKey("typeA", "item4"); // Active: {key3, key4}
      expect(keyManager.hasKeyInPool(key2)).toBe(true); // key2 should be recycled
      expect(keyManager.hasKeyInPool(key3)).toBe(false);
      expect(keyManager.hasKeyInPool(key4)).toBe(false);
    });
  });

  describe("recycleKey", () => {
    it("should add the key back to the correct pool", () => {
      const keyA = keyManager.getKey("typeA", "item1");
      const keyB = keyManager.getKey("typeB", "item2");

      expect(keyManager.hasKeyInPool(keyA)).toBe(false);
      expect(keyManager.hasKeyInPool(keyB)).toBe(false);

      keyManager.recycleKey(keyA);
      expect(keyManager.hasKeyInPool(keyA)).toBe(true);
      expect(keyManager.hasKeyInPool(keyB)).toBe(false); // keyB should remain active

      // Verify reuse from correct pool
      const reusedKeyA = keyManager.getKey("typeA", "item3");
      expect(reusedKeyA).toEqual(keyA);
    });

    it("should do nothing if the key does not exist or is already recycled", () => {
      const key = keyManager.getKey("typeA", "item1");
      keyManager.recycleKey(key); // Recycle it once

      // Get current state (how many keys active, how many in pool)
      // We need internal access or specific methods to check pool size directly.
      // Let's assume internal state is correct after first recycle.

      keyManager.recycleKey(key); // Try recycling again
      keyManager.recycleKey("nonExistentKey"); // Try recycling non-existent key

      // Verify state hasn't changed unexpectedly
      expect(keyManager.hasKeyInPool(key)).toBe(true); // Still in pool
      const newKey = keyManager.getKey("typeA", "item2");
      expect(newKey).toEqual(key); // Should still reuse the original key
    });
  });

  describe("hasKeyInPool", () => {
    it("should return false for an active key", () => {
      const key = keyManager.getKey("typeA", "item1");
      expect(keyManager.hasKeyInPool(key)).toBe(false);
    });

    it("should return true for a recycled key", () => {
      const key = keyManager.getKey("typeA", "item1");
      keyManager.recycleKey(key);
      expect(keyManager.hasKeyInPool(key)).toBe(true);
    });

    it("should return true for a key that was never generated", () => {
      expect(keyManager.hasKeyInPool("nonExistentKey")).toBe(true);
    });
  });

  describe("clearPool", () => {
    it("should clear all keys from all pools", () => {
      const keyA1 = keyManager.getKey("typeA", "item1");
      const keyA2 = keyManager.getKey("typeA", "item2");
      const keyB1 = keyManager.getKey("typeB", "item3");

      keyManager.recycleKey(keyA1);
      keyManager.recycleKey(keyB1);

      expect(keyManager.hasKeyInPool(keyA1)).toBe(true);
      expect(keyManager.hasKeyInPool(keyA2)).toBe(false); // Still active
      expect(keyManager.hasKeyInPool(keyB1)).toBe(true);

      keyManager.clearPool();

      expect(keyManager.hasKeyInPool(keyA1)).toBe(true); // Still not active
      expect(keyManager.hasKeyInPool(keyB1)).toBe(true); // Still not active
      expect(keyManager.hasKeyInPool(keyA2)).toBe(false); // Active keys remain

      // Getting new keys should generate new ones, not reuse cleared ones
      const newKeyA = keyManager.getKey("typeA", "item4");
      const newKeyB = keyManager.getKey("typeB", "item5");

      expect(newKeyA).not.toEqual(keyA1);
      expect(newKeyB).not.toEqual(keyB1);
      // Depending on implementation, newKeyA might be keyA1 if keyCounter wasn't reset
      // Check if key reuse happens after clearPool -> it shouldn't reuse from the *pool*
      const keyA3 = keyManager.getKey("typeA", "item5"); // Generate another A key
      keyManager.recycleKey(keyA3); // Recycle it
      keyManager.clearPool(); // Clear pools again
      keyManager.getKey("typeA", "item6"); // Get a new key
      expect(keyManager.hasKeyInPool(keyA3)).toBe(true); // keyA3 is not active
      // keyA4 should be newly generated, not reused from the cleared pool
      // Note: Due to sequential key generation, it *might* match a previous key numerically
      // but the crucial part is it wasn't reused *from the pool*.
    });

    it("should not affect active keys or stableId mappings", () => {
      const stableId = "stableClear";
      const keyA = keyManager.getKey("typeA", stableId);
      const keyB = keyManager.getKey("typeB", "item2");
      keyManager.recycleKey(keyB); // Put keyB in pool

      expect(keyManager.hasKeyInPool(keyA)).toBe(false);
      expect(keyManager.hasKeyInPool(keyB)).toBe(true);
      expect(keyManager.getKey("typeA", stableId)).toEqual(keyA); // Check stableId mapping

      keyManager.clearPool();

      expect(keyManager.hasKeyInPool(keyA)).toBe(false); // keyA still active
      expect(keyManager.hasKeyInPool(keyB)).toBe(true); // keyB still considered "in pool" (i.e., not active)
      expect(keyManager.getKey("typeA", stableId)).toEqual(keyA); // StableId mapping persists

      // Trying to get a key of type B should generate a new one
      const newKeyB = keyManager.getKey("typeB", "item3");
      expect(newKeyB).not.toEqual(keyB); // Because pool was cleared
    });
  });
});
