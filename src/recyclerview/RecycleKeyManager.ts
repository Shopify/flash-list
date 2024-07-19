export interface RecycleKeyManager {
  // gets new key for the item type, every item has it's on pool. The managers tracks which key is rendering which stableId
  // if a stableId is provided, it will return the key for that stableId, otherwise it will return a new key
  getKey: (itemType: string, stableId: string, currentKey?: string) => string;
  // when view is out of viewports, it should be recycled, this method should be called to recycle the key and add it back to the pool
  // Itemtype should already be known, as it was used to get the key
  recycleKey: (key: string) => void;
  // Checks if a key is available for recycling (unused)
  hasKeyInPool: (key: string) => boolean;
}

export class RecycleKeyManagerImpl implements RecycleKeyManager {
  // Maximum number of items (keys) that the manager can handle at any given time.
  private maxItems: number;

  // Map where each key is an item type, and the value is a set of keys associated with that item type.
  private keyPools: Map<string, Set<string>>;

  // Map that stores information about each key, including its associated item type and optional stableId.
  private keyMap: Map<string, { itemType: string; stableId?: string }>;

  // Map that stores the association between stableIds and their corresponding keys.
  private stableIdMap: Map<string, string>;

  // Counter for generating new keys.
  private keyCounter: number;

  // the overall pool size shouldn't exceed maxItems, if it does, it will start recycling the keys
  constructor(maxItems: number = Number.MAX_SAFE_INTEGER) {
    // Initialize the maximum number of items.
    this.maxItems = maxItems;

    // Initialize the map for key pools.
    this.keyPools = new Map();

    // Initialize the map for key metadata.
    this.keyMap = new Map();

    // Initialize the map for stableId to key associations.
    this.stableIdMap = new Map();

    // Initialize the key counter.
    this.keyCounter = 0;
  }

  /**
   * Gets a key for the specified item type. If a stableId is provided and already exists,
   * it returns the key associated with that stableId. Otherwise, it generates a new key
   * or reuses one from the pool.
   * @param itemType - The type of the item.
   * @param stableId - Optional stable identifier for the item.
   * @returns The key for the item.
   */
  public getKey(
    itemType: string,
    stableId: string,
    currentKey?: string
  ): string {
    // If a stableId is provided and already exists, return the associated key.
    if (stableId && this.stableIdMap.has(stableId)) {
      return this.stableIdMap.get(stableId)!;
    }

    // Get or create the pool for the specified item type.
    let pool = this.keyPools.get(itemType);
    if (!pool) {
      pool = new Set();
      this.keyPools.set(itemType, pool);
    }

    let key: string;
    // If the pool has available keys, reuse one.
    if (pool.size > 0) {
      key =
        currentKey && pool.has(currentKey)
          ? currentKey
          : pool.values().next().value;
      pool.delete(key);
    } else {
      // Otherwise, generate a new key using the counter.
      key = this.generateKey();
    }

    // Store the key and its associated item type and stableId.
    this.keyMap.set(key, { itemType, stableId });
    if (stableId) {
      this.stableIdMap.set(stableId, key);
    }

    // Ensure the overall pool size does not exceed the maximum limit.
    this.ensurePoolSize();

    return key;
  }

  /**
   * Recycles a key by adding it back to the pool for its item type.
   * @param key - The key to be recycled.
   */
  public recycleKey(key: string): void {
    const keyInfo = this.keyMap.get(key);

    if (!keyInfo) {
      return;
    }

    const { itemType, stableId } = keyInfo;
    if (stableId) {
      this.stableIdMap.delete(stableId);
    }

    let pool = this.keyPools.get(itemType);
    if (!pool) {
      pool = new Set();
      this.keyPools.set(itemType, pool);
    }

    pool.add(key);
    this.keyMap.delete(key);
  }

  // Checks if a key is available for recycling (unused)
  public hasKeyInPool(key: string): boolean {
    return !this.keyMap.has(key);
  }

  /**
   * Generates a unique key using a counter.
   * @returns A unique key.
   */
  private generateKey(): string {
    return (this.keyCounter++).toString();
  }

  /**
   * Ensures that the overall pool size does not exceed the maximum limit.
   * If it does, it recycles the oldest keys.
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
