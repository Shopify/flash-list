import { readFileSync } from "fs";
import { join } from "path";
import { createRef } from "react";
import { act, renderHook } from "@testing-library/react-native";

import { useRecyclerViewController } from "../recyclerview/hooks/useRecyclerViewController";
import { RecyclerViewManager } from "../recyclerview/RecyclerViewManager";
import { FlashListRef } from "../FlashListRef";
import { CompatScroller } from "../recyclerview/components/CompatScroller";

interface Item {
  key: string;
}

const WINDOW = { width: 400, height: 800 };

const propsFor = (keys: string[]) => ({
  data: keys.map((key) => ({ key })),
  keyExtractor: (item: Item) => item.key,
  renderItem: () => null,
  maintainVisibleContentPosition: {},
});

const sized = (indices: number[], height: number) =>
  indices.map((index) => ({
    index,
    dimensions: { width: WINDOW.width, height },
  }));

const range = (start: number, end: number) =>
  Array.from({ length: end - start }, (_, index) => start + index);

/** A list of `items` items, each `itemHeight` tall and measured, scrolled to `scrolledTo`. */
const mountController = ({
  items = 10,
  itemHeight = 200,
  scrolledTo = 250,
} = {}) => {
  const keys = Array.from({ length: items }, (_, index) => `item-${index}`);
  const manager = new RecyclerViewManager<Item>(propsFor(keys));
  const all = keys.map((_, index) => index);

  manager.updateLayoutParams(WINDOW, 0);
  // Every item measured, so the initial progressive render completes; until then scroll
  // offsets are not applied.
  for (let pass = 0; pass < 5; pass++) {
    if (!manager.modifyChildrenLayout(sized(all, itemHeight), items)) {
      break;
    }
  }
  manager.isFirstPaintOnUiComplete = true;
  manager.updateScrollOffset(scrolledTo);

  const scrollBy = jest.fn();
  const scrollTo = jest.fn();
  const ref = createRef<FlashListRef<Item>>();
  const scrollViewRef = {
    current: { scrollTo } as unknown as CompatScroller,
  };
  const scrollAnchorRef = { current: { scrollBy } };
  const hook = renderHook(() =>
    useRecyclerViewController(manager, ref, scrollViewRef, scrollAnchorRef)
  );
  const controller = () => hook.result.current;

  /**
   * Every shift applied so far: by moving the anchor view where the platform supports it, by a
   * plain scroll otherwise. Both are the same shift.
   */
  const shifts = () => [
    ...scrollBy.mock.calls.map(([diff]: [number]) => diff),
    ...scrollTo.mock.calls.map(
      ([params]: [{ y: number }]) => params.y - scrolledTo
    ),
  ];

  /**
   * Layout passes as the list runs them after a measurement: each pass that needs another render
   * renders again (and recomputes the rendered window); the pass with nothing left to re-render
   * applies the offset correction.
   */
  const settle = (measured: ReturnType<typeof sized>) => {
    let changed = manager.modifyChildrenLayout(
      measured,
      manager.getDataLength()
    );
    let passes = 0;
    while (changed && passes++ < 5) {
      changed = manager.modifyChildrenLayout([], manager.getDataLength());
    }
    act(() => controller().applyOffsetCorrection());
  };

  /**
   * One layout pass as the list runs it: a measurement that needs another render shifts the
   * anchor now, in the commit that moves the items; a pass with nothing left to re-render applies
   * the full correction. Returns whether another render was requested.
   */
  const layoutPass = (measured: ReturnType<typeof sized>) => {
    if (manager.modifyChildrenLayout(measured, manager.getDataLength())) {
      controller().applyAnchorShift();
      return true;
    }
    act(() => controller().applyOffsetCorrection());
    return false;
  };

  return {
    manager,
    controller,
    shifts,
    settle,
    layoutPass,
    unmount: hook.unmount,
  };
};

const sum = (values: number[]) =>
  values.reduce((total, value) => total + value, 0);

describe("useRecyclerViewController offset correction", () => {
  it("holds an anchor that measurements above it pushed out of the rendered window", () => {
    // Items above the anchor turn out far smaller than the layout had them (estimates being
    // measured, or the running estimate dropping): the anchor's layout moves up past the engaged
    // window while the user has not scrolled, so it is still the item on screen and must be held.
    const { manager, controller, shifts, settle, unmount } = mountController({
      items: 60,
      itemHeight: 500,
      scrolledTo: 15000,
    });
    controller().computeFirstVisibleIndexForOffsetCorrection();
    const anchorBefore = manager.getLayout(30).y;

    settle(sized(range(0, 20), 50));

    expect(manager.getEngagedIndices().toArray()).not.toContain(30);
    expect(sum(shifts())).toBe(manager.getLayout(30).y - anchorBefore);
    expect(sum(shifts())).not.toBe(0);
    unmount();
  });

  it("does not hold an anchor the user scrolled away from", () => {
    const { manager, controller, shifts, settle, unmount } = mountController({
      items: 60,
      itemHeight: 500,
      scrolledTo: 15000,
    });
    controller().computeFirstVisibleIndexForOffsetCorrection();

    // The user moves far down; the recorded anchor is no longer on screen.
    manager.updateScrollOffset(25000);
    settle(sized(range(0, 20), 50));

    expect(shifts()).toEqual([]);
    unmount();
  });
});

describe("useRecyclerViewController anchor shift", () => {
  it("moves the anchor in the same pass that measures an item above it", () => {
    const { manager, controller, shifts, unmount } = mountController();

    controller().computeFirstVisibleIndexForOffsetCorrection();
    manager.modifyChildrenLayout(sized([0], 300), manager.getDataLength());

    expect(controller().applyAnchorShift()).toBe(100);
    expect(shifts()).toEqual([100]);
    unmount();
  });

  it("shifts once per measurement, however many passes follow it", () => {
    const { manager, controller, shifts, unmount } = mountController();

    controller().computeFirstVisibleIndexForOffsetCorrection();
    manager.modifyChildrenLayout(sized([0], 300), manager.getDataLength());
    controller().applyAnchorShift();

    expect(controller().applyAnchorShift()).toBe(0);
    act(() => controller().applyOffsetCorrection());
    expect(shifts()).toEqual([100]);
    unmount();
  });

  it("holds the anchor through measurements that follow a shift in the same pass", () => {
    // Items just above the anchor grow far past the screen, and the items that then come into the
    // rendered window, still above the anchor, are measured too. The anchor must move by exactly
    // as much as everything above it did.
    const { manager, controller, shifts, layoutPass, unmount } =
      mountController({
        items: 60,
        itemHeight: 100,
        scrolledTo: 2000,
      });
    const anchorBefore = manager.getLayout(20).y;

    controller().computeFirstVisibleIndexForOffsetCorrection();
    layoutPass(sized([17, 18, 19], 500));
    const nowRendered = manager
      .getEngagedIndices()
      .toArray()
      .filter((index) => index < 17);
    let passes = 0;
    let changed = layoutPass(sized(nowRendered, 150));

    while (changed && passes++ < 5) {
      changed = layoutPass([]);
    }

    expect(sum(shifts())).toBe(manager.getLayout(20).y - anchorBefore);
    unmount();
  });

  it("leaves a change in the number of items to the correction after the commit", () => {
    const { manager, controller, shifts, unmount } = mountController();
    const keys = Array.from({ length: 11 }, (_, index) => `item-${index}`);

    controller().computeFirstVisibleIndexForOffsetCorrection();
    manager.updateProps(propsFor(keys));
    manager.updateLayoutParams(WINDOW, 0);
    manager.modifyChildrenLayout(sized([0], 300), manager.getDataLength());

    expect(controller().applyAnchorShift()).toBe(0);
    expect(shifts()).toEqual([]);

    // That path also moves the list's own offset and ignores scroll events while the native side
    // settles, which an early shift must never do.
    act(() => controller().applyOffsetCorrection());
    expect(shifts()).toEqual([100]);
    expect(manager.getAbsoluteLastScrollOffset()).toBe(350);
    expect(manager.ignoreScrollEvents).toBe(true);
    unmount();
  });

  it("is called by the list in the pass that re-renders measured items", () => {
    // RecyclerView's layout effect is not mounted here; check that it shifts the anchor right
    // before the re-render that moves the items.
    const source = readFileSync(
      join(__dirname, "../recyclerview/RecyclerView.tsx"),
      "utf8"
    );

    expect(source).toMatch(/applyAnchorShift\(\);\s*(\/\/.*\s*)*setRenderId\(/);
  });
});
