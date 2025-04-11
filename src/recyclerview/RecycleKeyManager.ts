export interface RecycleKeyManager {
  /**
   * Retrieves a unique key for an item type, maintaining a separate pool for each type.
   * If a stableId is provided and exists, returns the associated key.
   * Otherwise, generates a new key or reuses one from the pool.
   * @param itemType - The type/category of the item (e.g., 'header', 'product', 'footer')
   * @param stableId - Optional unique identifier for stable item tracking
   * @param currentKey - Optional current key to maintain if it exists in the pool
   * @returns A unique key for the item
   */
  getKey: (itemType: string, stableId: string, currentKey?: string) => string;

  /**
   * Recycles a key back into its item type's pool when the associated view is no longer visible.
   * This allows the key to be reused for new items of the same type.
   * @param key - The key to be recycled back into the pool
   */
  recycleKey: (key: string) => void;

  /**
   * Checks if a key is currently available in the recycling pool (not in use).
   * @param key - The key to check
   * @returns True if the key is available in the pool, false otherwise
   */
  hasKeyInPool: (key: string) => boolean;

  /**
   * Clears all recycled keys from the pool, resetting the recycling system.
   * This is useful when the list needs to be completely reset.
   */
  clearPool: () => void;
}

export class RecycleKeyManagerImpl implements RecycleKeyManager {
  // Maximum number of unique keys that can be active at any time
  private maxItems: number;

  // Stores pools of recycled keys for each item type
  private keyPools: Map<string, Set<string>>;

  // Maps active keys to their metadata (item type and stable ID)
  private keyMap: Map<string, { itemType: string; stableId?: string }>;

  // Maps stable IDs to their corresponding keys for quick lookups
  private stableIdMap: Map<string, string>;

  // Counter for generating unique sequential keys
  private keyCounter: number;

  /**
   * Creates a new RecycleKeyManager with a specified maximum number of items.
   * @param maxItems - Maximum number of unique keys that can be active simultaneously.
   *                   Defaults to Number.MAX_SAFE_INTEGER if not specified.
   */
  constructor(maxItems: number = Number.MAX_SAFE_INTEGER) {
    this.maxItems = maxItems;
    this.keyPools = new Map();
    this.keyMap = new Map();
    this.stableIdMap = new Map();
    this.keyCounter = 0;
  }

  /**
   * Gets a key for the specified item type, prioritizing stable ID associations.
   * If a stable ID exists, returns its associated key. Otherwise, either reuses
   * a key from the pool or generates a new one.
   * @param itemType - The type/category of the item
   * @param stableId - Optional unique identifier for stable item tracking
   * @param currentKey - Optional current key to maintain if it exists in the pool
   * @returns A unique key for the item
   */
  public getKey(
    itemType: string,
    stableId: string,
    currentKey?: string
  ): string {
    // Return existing key if stableId is already mapped
    if (stableId && this.stableIdMap.has(stableId)) {
      return this.stableIdMap.get(stableId)!;
    }

    // Get or create the pool for this item type
    let pool = this.keyPools.get(itemType);
    if (!pool) {
      pool = new Set();
      this.keyPools.set(itemType, pool);
    }

    let key: string;
    // Reuse existing key from pool if available
    if (pool.size > 0) {
      key =
        currentKey && pool.has(currentKey)
          ? currentKey
          : pool.values().next().value;
      pool.delete(key);
    } else {
      // Generate new key if pool is empty
      key = this.generateKey();
    }

    // Update mappings with new key information
    this.keyMap.set(key, { itemType, stableId });
    if (stableId) {
      this.stableIdMap.set(stableId, key);
    }

    // Ensure we don't exceed the maximum number of active keys
    this.ensurePoolSize();

    return key;
  }

  /**
   * Recycles a key by adding it back to its item type's pool and cleaning up
   * associated mappings. This should be called when a view is no longer visible.
   * @param key - The key to be recycled
   */
  public recycleKey(key: string): void {
    const keyInfo = this.keyMap.get(key);

    if (!keyInfo) {
      return;
    }

    const { itemType, stableId } = keyInfo;
    // Clean up stable ID mapping if it exists
    if (stableId) {
      this.stableIdMap.delete(stableId);
    }

    // Add key back to its type's pool
    let pool = this.keyPools.get(itemType);
    if (!pool) {
      pool = new Set();
      this.keyPools.set(itemType, pool);
    }

    pool.add(key);
    this.keyMap.delete(key);
  }

  /**
   * Checks if a key is currently available in the recycling pool.
   * @param key - The key to check
   * @returns True if the key is available in the pool, false otherwise
   */
  public hasKeyInPool(key: string): boolean {
    return !this.keyMap.has(key);
  }

  /**
   * Clears all recycled keys from the pool, effectively resetting the recycling system.
   * This operation does not affect currently active keys.
   */
  public clearPool() {
    this.keyPools.clear();
  }

  /**
   * Generates a unique sequential key using an internal counter.
   * @returns A unique key as a string
   */
  private generateKey(): string {
    return (this.keyCounter++).toString();
  }

  /**
   * Ensures the total number of active keys doesn't exceed the maximum limit.
   * If the limit is exceeded, recycles the oldest keys until within bounds.
   * Note: This operation may impact performance when dealing with large lists.
   * TODO: Check performance impact of this
   */
  private ensurePoolSize(): void {
    if (this.keyMap.size <= this.maxItems) return;

    const keysToRecycle = Array.from(this.keyMap.keys()).slice(
      0,
      this.keyMap.size - this.maxItems
    );
    for (const key of keysToRecycle) {
      this.recycleKey(key);
    }
  }
}
