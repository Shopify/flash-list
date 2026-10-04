import { RVEngagedIndicesTrackerImpl } from "../recyclerview/helpers/EngagedIndicesTracker";
import { RVLayoutManager } from "../recyclerview/layout-managers/LayoutManager";

import {
  getAllLayouts,
  LayoutManagerType,
  createLayoutManager,
  createMockLayoutInfo,
} from "./helpers/createLayoutManager";

/**
 * getVisibleLayouts() binary searches for the first item whose end passes the
 * viewport start. That needs item ends to grow with the index, which holds for a
 * linear or grid layout but not for masonry, where a tall item in one column can
 * reach far past a short item placed after it.
 */

const masonry = (heights: number[], maxColumns = 2, columnWidth = 200) => {
  const manager = createLayoutManager(LayoutManagerType.MASONRY, {
    windowSize: { width: columnWidth * maxColumns, height: 900 },
    maxColumns,
    optimizeItemArrangement: true,
  });
  manager.modifyLayout(
    heights.map((height, index) =>
      createMockLayoutInfo(index, columnWidth, height)
    ),
    heights.length
  );
  return manager;
};

/** What getVisibleLayouts() is defined to return, computed the slow honest way. */
const scanForVisibleRange = (
  manager: RVLayoutManager,
  start: number,
  end: number
) => {
  const layouts = getAllLayouts(manager);
  let first = -1;
  let last = -1;
  layouts.forEach((layout, index) => {
    if (first === -1 && layout.y + layout.height > start) {
      first = index;
    }
    if (layout.y <= end) {
      last = index;
    }
  });
  return first === -1 || last === -1 || first > last
    ? { startIndex: -1, endIndex: -2 }
    : { startIndex: first, endIndex: last };
};

const rangeOf = (manager: RVLayoutManager, start: number, end: number) => {
  const range = manager.getVisibleLayouts(start, end);
  return { startIndex: range.startIndex, endIndex: range.endIndex };
};

describe("masonry getVisibleLayouts", () => {
  it("keeps a tall item that a later short item hides from the search", () => {
    // Column 0 takes every short item, so one 800pt item owns column 1 outright.
    const manager = masonry([100, 800, 100, 100, 100, 100]);
    expect(getAllLayouts(manager).map((layout) => layout.y)).toEqual([
      0, 0, 100, 200, 300, 400,
    ]);

    // Item 1 covers 0-800 and fills the right half of this viewport; item 5
    // covers 400-500 and clips its top. Everything between ends above it.
    expect(rangeOf(manager, 450, 600)).toEqual({ startIndex: 1, endIndex: 5 });
  });

  it("keeps a tall item the search walks straight past", () => {
    // One 3000pt item owns column 1 while twenty short items stack up column 0.
    // Every probe the search makes lands among the short ones, so it finds no
    // visible item at all and used to report an empty range.
    const manager = masonry([100, 3000, ...new Array(20).fill(100)]);
    const layouts = getAllLayouts(manager);
    expect(layouts[1].height).toBe(3000);
    expect(
      Math.max(...layouts.slice(2).map((item) => item.y + item.height))
    ).toBe(2100);

    // Only the tall item reaches a viewport starting at 2500.
    expect(rangeOf(manager, 2500, 2900)).toEqual({
      startIndex: 1,
      endIndex: 21,
    });
  });

  it("matches a full scan across column counts, item sizes and offsets", () => {
    let checked = 0;
    for (const maxColumns of [1, 2, 3, 4]) {
      for (const [base, spread] of [
        [20, 80],
        [60, 500],
        [200, 1200],
      ]) {
        // Deterministic pseudo random heights, no reliance on Math.random.
        let seed = maxColumns * 7919 + base;
        const nextHeight = () => {
          seed = (seed * 1103515245 + 12345) % 2147483648;
          return base + Math.floor((seed / 2147483648) * spread);
        };
        const manager = masonry(
          Array.from({ length: 60 }, nextHeight),
          maxColumns,
          400 / maxColumns
        );
        const total = manager.getLayoutSize().height;
        for (let start = -200; start < total + 400; start += 29) {
          const end = start + 900;
          expect(rangeOf(manager, start, end)).toEqual(
            scanForVisibleRange(manager, start, end)
          );
          checked++;
        }
      }
    }
    expect(checked).toBeGreaterThan(1000);
  });

  it("renders a tall item that the viewport is sitting inside", () => {
    // The draw distance buffer hides the miss for ordinary item sizes, so this
    // uses an item taller than the viewport plus the buffer.
    const manager = masonry([100, 100, 2000, 100, 100, 100, 100, 100]);
    const tracker = new RVEngagedIndicesTrackerImpl();
    const layouts = getAllLayouts(manager);
    const tallItem = layouts[2];
    const offset = tallItem.y + 900;

    tracker.updateScrollOffset(offset, undefined, manager);

    expect(tallItem.y).toBeLessThan(offset);
    expect(tallItem.y + tallItem.height).toBeGreaterThan(offset + 900);
    expect(tracker.getEngagedIndices().includes(2)).toBe(true);
  });
});
