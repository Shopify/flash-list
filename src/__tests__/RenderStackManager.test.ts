import { RenderStackManager } from "../recyclerview/RenderStackManager";
import { ConsecutiveNumbers } from "../recyclerview/helpers/ConsecutiveNumbers";

const mock1Data = [
  { id: 1, name: "Item 1", itemType: "type1" },
  { id: 2, name: "Item 2", itemType: "type2" },
  { id: 3, name: "Item 3", itemType: "type1" },
  { id: 4, name: "Item 4", itemType: "type2" },
  { id: 5, name: "Item 5", itemType: "type1" },
  { id: 6, name: "Item 6", itemType: "type2" },
  { id: 7, name: "Item 7", itemType: "type1" },
  { id: 8, name: "Item 8", itemType: "type2" },
  { id: 9, name: "Item 9", itemType: "type1" },
  { id: 10, name: "Item 10", itemType: "type2" },
  { id: 11, name: "Item 11", itemType: "type1" },
];
const mock1 = {
  data: mock1Data,
  getStableId: (index: number) => mock1Data[index].id.toString(),
  getItemType: (index: number) => mock1Data[index].itemType,
  length: mock1Data.length,
};

const mock2Data = [
  { id: 5, name: "Item 1", itemType: "type1" },
  { id: 6, name: "Item 2", itemType: "type2" },
  { id: 7, name: "Item 3", itemType: "type1" },
  { id: 8, name: "Item 4", itemType: "type2" },
  { id: 9, name: "Item 5", itemType: "type1" },
  { id: 10, name: "Item 6", itemType: "type2" },
  { id: 11, name: "Item 7", itemType: "type1" },
  { id: 12, name: "Item 8", itemType: "type2" },
  { id: 13, name: "Item 9", itemType: "type1" },
  { id: 14, name: "Item 10", itemType: "type2" },
  { id: 15, name: "Item 11", itemType: "type1" },
];
const mock2 = {
  data: mock2Data,
  getStableId: (index: number) => mock2Data[index].id.toString(),
  getItemType: (index: number) => mock2Data[index].itemType,
  length: mock2Data.length,
};

const mock3Data = [
  { id: 1, name: "Item 1", itemType: "type1" },
  { id: 2, name: "Item 2", itemType: "type1" },
  { id: 3, name: "Item 3", itemType: "type1" },
  { id: 4, name: "Item 4", itemType: "type1" },
  { id: 5, name: "Item 5", itemType: "type1" },
  { id: 6, name: "Item 6", itemType: "type1" },
  { id: 7, name: "Item 7", itemType: "type1" },
  { id: 8, name: "Item 8", itemType: "type1" },
  { id: 9, name: "Item 9", itemType: "type1" },
  { id: 10, name: "Item 10", itemType: "type1" },
  { id: 11, name: "Item 11", itemType: "type1" },
  { id: 12, name: "Item 12", itemType: "type1" },
  { id: 13, name: "Item 13", itemType: "type1" },
  { id: 14, name: "Item 14", itemType: "type1" },
  { id: 15, name: "Item 15", itemType: "type1" },
];
const mock3 = {
  data: mock3Data,
  getStableId: (index: number) => mock3Data[index].id.toString(),
  getItemType: (index: number) => mock3Data[index].itemType,
  length: mock3Data.length,
};

const mock4Data = [
  { id: 1, name: "Item 1", itemType: "type1" },
  { id: 2, name: "Item 2", itemType: "type1" },
  { id: 3, name: "Item 3", itemType: "type1" },
  { id: 4, name: "Item 4", itemType: "type1" },
  { id: 5, name: "Item 5", itemType: "type1" },
  { id: 6, name: "Item 6", itemType: "type1" },
  { id: 7, name: "Item 7", itemType: "type1" },
  { id: 8, name: "Item 8", itemType: "type2" },
  { id: 9, name: "Item 9", itemType: "type2" },
  { id: 10, name: "Item 10", itemType: "type2" },
  { id: 11, name: "Item 11", itemType: "type2" },
  { id: 12, name: "Item 12", itemType: "type2" },
  { id: 13, name: "Item 13", itemType: "type2" },
  { id: 14, name: "Item 14", itemType: "type2" },
  { id: 15, name: "Item 15", itemType: "type2" },
];
const mock4 = {
  data: mock4Data,
  getStableId: (index: number) => mock4Data[index].id.toString(),
  getItemType: (index: number) => mock4Data[index].itemType,
  length: mock4Data.length,
};

const mock5Data = [
  { id: 1, name: "Item 1", itemType: "type2" },
  { id: 2, name: "Item 2", itemType: "type2" },
  { id: 3, name: "Item 3", itemType: "type2" },
  { id: 4, name: "Item 4", itemType: "type2" },
  { id: 5, name: "Item 5", itemType: "type2" },
  { id: 6, name: "Item 6", itemType: "type2" },
  { id: 7, name: "Item 7", itemType: "type2" },
  { id: 8, name: "Item 8", itemType: "type1" },
  { id: 9, name: "Item 9", itemType: "type1" },
  { id: 10, name: "Item 10", itemType: "type1" },
  { id: 11, name: "Item 11", itemType: "type1" },
  { id: 12, name: "Item 12", itemType: "type1" },
  { id: 13, name: "Item 13", itemType: "type1" },
  { id: 14, name: "Item 14", itemType: "type1" },
  { id: 15, name: "Item 15", itemType: "type1" },
];
const mock5 = {
  data: mock5Data,
  getStableId: (index: number) => mock5Data[index].id.toString(),
  getItemType: (index: number) => mock5Data[index].itemType,
  length: mock5Data.length,
};

const mock6Data = [
  { id: 0, name: "Item 0", itemType: "type1" },
  { id: 1, name: "Item 1", itemType: "type1" },
  { id: 2, name: "Item 2", itemType: "type1" },
  { id: 3, name: "Item 3", itemType: "type1" },
  { id: 4, name: "Item 4", itemType: "type1" },
  { id: 5, name: "Item 5", itemType: "type1" },
  { id: 6, name: "Item 6", itemType: "type1" },
  { id: 7, name: "Item 7", itemType: "type1" },
];
const mock6 = {
  data: mock6Data,
  getStableId: (index: number) => mock6Data[index].id.toString(),
  getItemType: (index: number) => mock6Data[index].itemType,
  length: mock6Data.length,
};

const mock7Data = [
  { id: 0, name: "Item 0", itemType: "type1" },
  { id: 2, name: "Item 2", itemType: "type1" },
  { id: 3, name: "Item 3", itemType: "type1" },
  { id: 4, name: "Item 4", itemType: "type1" },
  { id: 5, name: "Item 5", itemType: "type1" },
  { id: 6, name: "Item 6", itemType: "type1" },
  { id: 7, name: "Item 7", itemType: "type1" },
  { id: 8, name: "Item 8", itemType: "type1" },
];
const mock7 = {
  data: mock7Data,
  getStableId: (index: number) => mock7Data[index].id.toString(),
  getItemType: (index: number) => mock7Data[index].itemType,
  length: mock7Data.length,
};

const mock8Data = [
  { id: 16, name: "Item 16", itemType: "type1" },
  { id: 17, name: "Item 17", itemType: "type1" },
  { id: 18, name: "Item 18", itemType: "type1" },
  { id: 19, name: "Item 19", itemType: "type1" },
  { id: 20, name: "Item 20", itemType: "type1" },
  { id: 1, name: "Item 1", itemType: "type1" },
  { id: 2, name: "Item 2", itemType: "type1" },
  { id: 3, name: "Item 3", itemType: "type1" },
  { id: 4, name: "Item 4", itemType: "type1" },
  { id: 5, name: "Item 5", itemType: "type1" },
  { id: 6, name: "Item 6", itemType: "type1" },
  { id: 7, name: "Item 7", itemType: "type1" },
  { id: 8, name: "Item 8", itemType: "type1" },
  { id: 9, name: "Item 9", itemType: "type1" },
  { id: 10, name: "Item 10", itemType: "type1" },
  { id: 11, name: "Item 11", itemType: "type1" },
  { id: 12, name: "Item 12", itemType: "type1" },
  { id: 13, name: "Item 13", itemType: "type1" },
  { id: 14, name: "Item 14", itemType: "type1" },
  { id: 15, name: "Item 15", itemType: "type1" },
];
const mock8 = {
  data: mock8Data,
  getStableId: (index: number) => mock8Data[index].id.toString(),
  getItemType: (index: number) => mock8Data[index].itemType,
  length: mock8Data.length,
};

// Helper to create mock data structures
const createMockData = (
  items: { id: string | number; itemType: string; name?: string }[]
) => {
  return {
    data: items.map((item) => ({
      ...item,
      name: item.name || `Item ${item.id}`,
    })),
    getStableId: (index: number) => items[index].id.toString(),
    getItemType: (index: number) => items[index].itemType,
    length: items.length,
  };
};

// Helper to run sync and get sorted keys from the entire keyMap
const runSyncAndGetEntireKeyMapKeys = (
  manager: RenderStackManager,
  mock: {
    data: any[];
    getStableId: (index: number) => string;
    getItemType: (index: number) => string;
    length: number;
  },
  engagedIndicesOverride?: ConsecutiveNumbers
) => {
  const dataLength = mock.length;
  const engaged =
    engagedIndicesOverride ??
    new ConsecutiveNumbers(0, dataLength > 0 ? dataLength - 1 : -1);
  manager.sync(mock.getStableId, mock.getItemType, engaged, dataLength);
  return Array.from(manager.getRenderStack().keys()).sort(
    (keyA, keyB) => Number(keyA) - Number(keyB)
  );
};

// Helper to get keys specific to the items in a mock, after a sync
const getKeysForMockItems = (
  manager: RenderStackManager,
  mockData: {
    data: { id: any }[];
    getStableId: (index: number) => string;
    length: number;
  }
) => {
  const stack = manager.getRenderStack();
  const keys = [];
  // Ensure we only try to get keys for items that exist in mockData
  for (let i = 0; i < mockData.length; i++) {
    const stableId = mockData.getStableId(i);
    for (const [key, info] of stack.entries()) {
      if (info.stableId === stableId) {
        keys.push(key);
        break;
      }
    }
  }
  return keys.sort((keyA, keyB) => Number(keyA) - Number(keyB));
};

const emptyMock = createMockData([]);
const mockDataA5 = createMockData([
  { id: "s1", itemType: "typeA" },
  { id: "s2", itemType: "typeA" },
  { id: "s3", itemType: "typeA" },
  { id: "s4", itemType: "typeA" },
  { id: "s5", itemType: "typeA" },
]);
const mockDataB3 = createMockData([
  { id: "s6", itemType: "typeA" },
  { id: "s7", itemType: "typeA" },
  { id: "s8", itemType: "typeA" },
]);

describe("RenderStackManager", () => {
  it("should reuse keys from removed items when transitioning from mock1 to mock2", () => {
    const renderStackManager = new RenderStackManager();
    runSyncAndGetEntireKeyMapKeys(renderStackManager, mock1);
    const oldRenderStackKeys = Array.from(
      renderStackManager.getRenderStack().keys()
    ).sort((keyA, keyB) => Number(keyA) - Number(keyB));

    runSyncAndGetEntireKeyMapKeys(renderStackManager, mock2);
    const newRenderStackKeys = Array.from(
      renderStackManager.getRenderStack().keys()
    ).sort((keyA, keyB) => Number(keyA) - Number(keyB));
    expect(newRenderStackKeys).toEqual(oldRenderStackKeys);
  });

  it("should reuse keys changing item types when transitioning from mock3 to mock4", () => {
    const renderStackManager = new RenderStackManager();
    runSyncAndGetEntireKeyMapKeys(renderStackManager, mock3);
    const oldRenderStackKeys = Array.from(
      renderStackManager.getRenderStack().keys()
    ).sort((keyA, keyB) => Number(keyA) - Number(keyB));

    runSyncAndGetEntireKeyMapKeys(renderStackManager, mock4);
    const newRenderStackKeys = Array.from(
      renderStackManager.getRenderStack().keys()
    ).sort((keyA, keyB) => Number(keyA) - Number(keyB));
    expect(newRenderStackKeys).toEqual(oldRenderStackKeys);
  });

  it("should reuse keys changing item types when transitioning from mock4 to mock5", () => {
    const renderStackManager = new RenderStackManager();
    runSyncAndGetEntireKeyMapKeys(renderStackManager, mock4);
    const oldRenderStackKeys = Array.from(
      renderStackManager.getRenderStack().keys()
    ).sort((keyA, keyB) => Number(keyA) - Number(keyB));

    runSyncAndGetEntireKeyMapKeys(renderStackManager, mock5);
    const newRenderStackKeys = Array.from(
      renderStackManager.getRenderStack().keys()
    ).sort((keyA, keyB) => Number(keyA) - Number(keyB));
    expect(newRenderStackKeys).toEqual(oldRenderStackKeys);
  });

  it("should have all keys from mock1 when going from mock1 to mock5", () => {
    const renderStackManager = new RenderStackManager();
    runSyncAndGetEntireKeyMapKeys(renderStackManager, mock1);
    const oldRenderStackKeys = Array.from(
      renderStackManager.getRenderStack().keys()
    ).sort((keyA, keyB) => Number(keyA) - Number(keyB));

    runSyncAndGetEntireKeyMapKeys(renderStackManager, mock5);
    const newRenderStackKeys = Array.from(
      renderStackManager.getRenderStack().keys()
    ).sort((keyA, keyB) => Number(keyA) - Number(keyB));

    oldRenderStackKeys.forEach((key) => {
      expect(newRenderStackKeys).toContain(key);
    });
  });
});

describe("RenderStackManager with disableRecycling = true", () => {
  it("should assign new, non-recycled keys to new items when disableRecycling is true", () => {
    const rsm = new RenderStackManager();
    rsm.disableRecycling = true;

    // Sync with A5 first
    runSyncAndGetEntireKeyMapKeys(rsm, mockDataA5);
    const keysA5 = getKeysForMockItems(rsm, mockDataA5);
    expect(keysA5).toEqual(["0", "1", "2", "3", "4"]);

    // Sync with B3
    runSyncAndGetEntireKeyMapKeys(rsm, mockDataB3);
    const keysB3 = getKeysForMockItems(rsm, mockDataB3);
    expect(keysB3).toEqual(["5", "6", "7"]); // New keys for B3 items

    // Ensure B3 keys don't overlap with A5 keys that might remain in keyMap
    keysA5.forEach((keyA) => {
      expect(keysB3).not.toContain(keyA);
    });

    // Check the final state of the entire keyMap
    // After B3 sync, keys for A5 items at original indices 3,4 (stableIds "s4","s5")
    // should be removed because 3 >= B3.length (3) and 4 >= B3.length (3). Keys for 0,1,2 from A5 remain.
    const allKeysInMap = runSyncAndGetEntireKeyMapKeys(rsm, mockDataB3); // This re-syncs B3, ensuring state is for B3
    expect(
      allKeysInMap.sort((keyA, keyB) => Number(keyA) - Number(keyB))
    ).toEqual(["5", "6", "7"]);
  });

  it("should generate all new keys if starting with disableRecycling = true and items are removed then added", () => {
    const rsm = new RenderStackManager();
    rsm.disableRecycling = true;

    runSyncAndGetEntireKeyMapKeys(rsm, mockDataA5); // Assigns keys "0" through "4"
    runSyncAndGetEntireKeyMapKeys(rsm, emptyMock); // Sync with empty
    expect(getKeysForMockItems(rsm, emptyMock)).toEqual([]);

    runSyncAndGetEntireKeyMapKeys(rsm, mockDataB3); // Sync with new data
    const keysForNewItems = getKeysForMockItems(rsm, mockDataB3);
    expect(keysForNewItems).toEqual(["5", "6", "7"]);
  });
});

describe("RenderStackManager with maxItemsInRecyclePool", () => {
  it("should not recycle any keys when maxItemsInRecyclePool is 0", () => {
    const rsm = new RenderStackManager(0); // maxItemsInRecyclePool = 0

    runSyncAndGetEntireKeyMapKeys(rsm, mockDataA5);
    runSyncAndGetEntireKeyMapKeys(rsm, emptyMock); // Sync with empty, dataLength = 0. All keys are cleaned up.

    runSyncAndGetEntireKeyMapKeys(rsm, mockDataB3);
    const keys2 = getKeysForMockItems(rsm, mockDataB3);
    expect(keys2).toEqual(["5", "6", "7"]); // Expect new keys as pool was cleared by emptyMock sync
  });

  it("should effectively not recycle if intermediate sync has dataLength 0, regardless of maxPoolSize", () => {
    const maxPoolSize = 2;
    const rsm = new RenderStackManager(maxPoolSize);

    runSyncAndGetEntireKeyMapKeys(rsm, mockDataA5);
    runSyncAndGetEntireKeyMapKeys(rsm, emptyMock); // Sync with empty, dataLength = 0. All keys are cleaned up from pool and map.

    const mockDataA3NewIds = createMockData([
      { id: "s10", itemType: "typeA" },
      { id: "s11", itemType: "typeA" },
      { id: "s12", itemType: "typeA" },
    ]);
    runSyncAndGetEntireKeyMapKeys(rsm, mockDataA3NewIds);
    const newKeys = getKeysForMockItems(rsm, mockDataA3NewIds);
    // Because emptyMock sync (dataLength=0) clears all keys, these will be new.
    expect(newKeys).toEqual(["5", "6", "7"]);
  });
  it("should not repeat index when going from mock6 to mock7", () => {
    const rsm = new RenderStackManager();
    rsm.disableRecycling = true;
    runSyncAndGetEntireKeyMapKeys(rsm, mock6);
    runSyncAndGetEntireKeyMapKeys(rsm, mock7);
    const set = new Set<number>();
    Array.from(rsm.getRenderStack().entries()).forEach(([key, info]) => {
      expect(set.has(info.index)).toBe(false);
      set.add(info.index);
    });
  });
});

describe("RenderStackManager edge cases", () => {
  it("should handle initial sync with empty data and then add items", () => {
    const rsm = new RenderStackManager();
    runSyncAndGetEntireKeyMapKeys(rsm, emptyMock);
    expect(getKeysForMockItems(rsm, emptyMock)).toEqual([]);

    runSyncAndGetEntireKeyMapKeys(rsm, mockDataA5);
    expect(getKeysForMockItems(rsm, mockDataA5)).toEqual([
      "0",
      "1",
      "2",
      "3",
      "4",
    ]);
  });

  it("should generate new keys if all items removed (synced with empty) and then different items added", () => {
    const rsm = new RenderStackManager(); // Default large pool size
    runSyncAndGetEntireKeyMapKeys(rsm, mockDataA5);
    runSyncAndGetEntireKeyMapKeys(rsm, emptyMock); // Sync with empty, dataLength = 0. All keys are cleaned up.

    const mockDataA3NewIds = createMockData([
      { id: "s10", itemType: "typeA" },
      { id: "s11", itemType: "typeA" },
      { id: "s12", itemType: "typeA" },
    ]);
    runSyncAndGetEntireKeyMapKeys(rsm, mockDataA3NewIds);
    const newKeys = getKeysForMockItems(rsm, mockDataA3NewIds);
    // Expect new keys as the emptyMock sync (dataLength=0) cleared the pool and map.
    expect(newKeys).toEqual(["5", "6", "7"]);
  });

  it("should use new keys if types change completely and no compatible recycled keys exist (after empty sync)", () => {
    const rsm = new RenderStackManager();
    runSyncAndGetEntireKeyMapKeys(rsm, mockDataA5);
    runSyncAndGetEntireKeyMapKeys(rsm, emptyMock); // Clear with empty sync

    runSyncAndGetEntireKeyMapKeys(rsm, mockDataB3);
    const keysTypeB = getKeysForMockItems(rsm, mockDataB3);
    expect(keysTypeB).toEqual(["5", "6", "7"]); // Should be new keys after empty sync

    const mockSingleTypeA = createMockData([{ id: "s20", itemType: "typeA" }]);
    runSyncAndGetEntireKeyMapKeys(rsm, mockSingleTypeA);
    const keyForS20 = getKeysForMockItems(rsm, mockSingleTypeA);
    // After empty sync and B3 sync, A's pool is gone. Key counter is at 8.
    expect(keyForS20).toEqual(["5"]);
  });

  it("should maintain keys if data and engaged indices do not change", () => {
    const rsm = new RenderStackManager();
    runSyncAndGetEntireKeyMapKeys(rsm, mockDataA5);
    const keys1 = getKeysForMockItems(rsm, mockDataA5);

    runSyncAndGetEntireKeyMapKeys(rsm, mockDataA5);
    const keys2 = getKeysForMockItems(rsm, mockDataA5);
    expect(keys2).toEqual(keys1);
  });

  it("should not delete keys from pool if they are not visible on index changes when going from mock6 to mock7", () => {
    const rsm = new RenderStackManager();
    runSyncAndGetEntireKeyMapKeys(rsm, mock6);
    runSyncAndGetEntireKeyMapKeys(rsm, mock7, new ConsecutiveNumbers(3, 5));
    const keys = getKeysForMockItems(rsm, mock7);
    expect(keys).toEqual(["0", "1", "2", "3", "4", "5", "6", "7"]);
  });

  it("should not delete keys from pool if they are not visible on index changes when going from mock3 to mock8", () => {
    const rsm = new RenderStackManager();
    runSyncAndGetEntireKeyMapKeys(rsm, mock3, new ConsecutiveNumbers(0, 10));
    runSyncAndGetEntireKeyMapKeys(rsm, mock8, new ConsecutiveNumbers(0, 13));
    const keys = getKeysForMockItems(rsm, mock8);
    expect(keys).toEqual([
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
    ]);
  });

  it("should delete keys from pool if they are not visible on index changes when going from mock6 to mock7 (disableRecycling = true)", () => {
    const rsm = new RenderStackManager();
    rsm.disableRecycling = true;
    runSyncAndGetEntireKeyMapKeys(rsm, mock6);
    runSyncAndGetEntireKeyMapKeys(rsm, mock7, new ConsecutiveNumbers(3, 5));
    const keys = getKeysForMockItems(rsm, mock7);
    expect(keys).toEqual(["0", "2", "3", "4", "5", "6", "8"]);
  });

  it("should not delete keys from pool if they are not visible on index changes when going from mock6 to mock7 (all engaged)", () => {
    const rsm = new RenderStackManager();
    runSyncAndGetEntireKeyMapKeys(rsm, mock6);
    runSyncAndGetEntireKeyMapKeys(rsm, mock7);
    const keys = getKeysForMockItems(rsm, mock7);
    expect(keys).toEqual(["0", "1", "2", "3", "4", "5", "6", "7"]);
  });

  it("should delete keys from pool if they are not visible on index changes when going from mock6 to mock7 (all engaged,disableRecycling = true)", () => {
    const rsm = new RenderStackManager();
    rsm.disableRecycling = true;
    runSyncAndGetEntireKeyMapKeys(rsm, mock6);
    runSyncAndGetEntireKeyMapKeys(rsm, mock7);
    const keys = getKeysForMockItems(rsm, mock7);
    expect(keys).toEqual(["0", "2", "3", "4", "5", "6", "7", "8"]);
  });

  it("should correctly handle partial replacement of items, reusing keys for stable items and recycling for replaced ones", () => {
    const rsm = new RenderStackManager();
    const initialMock = createMockData([
      { id: "s1", itemType: "typeA" },
      { id: "s2", itemType: "typeA" },
      { id: "s3", itemType: "typeA" },
      { id: "s4", itemType: "typeA" },
    ]);
    runSyncAndGetEntireKeyMapKeys(rsm, initialMock);
    const initialKeyMap = new Map<string, string>();
    // Populate initialKeyMap correctly using getKeysForMockItems and stable IDs
    initialMock.data.forEach((itemData, index) => {
      // Get the keys for the initialMock items AFTER the sync.
      const currentKeysForInitialMock = getKeysForMockItems(rsm, initialMock);
      const key = currentKeysForInitialMock[index]; // Assumes keys are in order of data
      if (key !== undefined) {
        // Ensure key exists before setting
        initialKeyMap.set(itemData.id.toString(), key);
      }
    });

    const keyForS1 = initialKeyMap.get("s1")!;
    const keyForS2 = initialKeyMap.get("s2")!;
    const keyForS3 = initialKeyMap.get("s3")!;
    const keyForS4 = initialKeyMap.get("s4")!;

    const partiallyReplacedMock = createMockData([
      { id: "s1", itemType: "typeA" },
      { id: "s5", itemType: "typeA" },
      { id: "s6", itemType: "typeA" },
      { id: "s4", itemType: "typeA" },
    ]);
    runSyncAndGetEntireKeyMapKeys(rsm, partiallyReplacedMock);
    const finalKeyMap = new Map<string, string>();
    partiallyReplacedMock.data.forEach((itemData, index) => {
      // Get keys for partiallyReplacedMock items AFTER the sync.
      const currentKeysForPartialMock = getKeysForMockItems(
        rsm,
        partiallyReplacedMock
      );
      const key = currentKeysForPartialMock[index]; // Assumes keys are in order
      if (key !== undefined) {
        // Ensure key exists
        finalKeyMap.set(itemData.id.toString(), key);
      }
    });

    expect(finalKeyMap.get("s1")).toBe(keyForS1);
    expect(finalKeyMap.get("s4")).toBe(keyForS4);
    expect([finalKeyMap.get("s5"), finalKeyMap.get("s6")]).toEqual(
      expect.arrayContaining([keyForS2, keyForS3])
    );
    expect(finalKeyMap.get("s5")).not.toBe(finalKeyMap.get("s6"));

    const finalKeysForCurrentItems = getKeysForMockItems(
      rsm,
      partiallyReplacedMock
    );
    expect(finalKeysForCurrentItems).toEqual(["0", "1", "2", "3"]);
  });
});
