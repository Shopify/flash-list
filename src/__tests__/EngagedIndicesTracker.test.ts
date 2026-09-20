import {
  RVEngagedIndicesTrackerImpl,
  Velocity,
} from "../recyclerview/helpers/EngagedIndicesTracker";
import { RVLayoutManager } from "../recyclerview/layout-managers/LayoutManager";

import {
  createPopulatedLayoutManager,
  LayoutManagerType,
} from "./helpers/createLayoutManager";

const ROW_HEIGHT = 88;
const VIEWPORT_HEIGHT = 700;
const ITEM_COUNT = 100; // content size: 8800px
const CONTENT_SIZE = ROW_HEIGHT * ITEM_COUNT;
// Mid-list offset, aligned to a row boundary; phase sweeps add 0..87px
const BASE_OFFSET = 2200;

describe("EngagedIndicesTracker", () => {
  const createTrackerLayoutManager = (): RVLayoutManager => {
    return createPopulatedLayoutManager(
      LayoutManagerType.LINEAR,
      ITEM_COUNT,
      { windowSize: { width: 400, height: VIEWPORT_HEIGHT } },
      400,
      ROW_HEIGHT
    );
  };

  const createTracker = (
    drawDistance: number,
    averageRenderTime: number,
    direction: "forward" | "backward"
  ): RVEngagedIndicesTrackerImpl => {
    const tracker = new RVEngagedIndicesTrackerImpl();
    tracker.drawDistance = drawDistance;
    tracker.averageRenderTime = averageRenderTime;
    tracker.setScrollDirection(direction);
    return tracker;
  };

  /**
   * Updates the tracker at the given offset with a steady velocity.
   * Repeats the update so the tracker's median velocity equals `velocity`,
   * simulating a sustained fling rather than a single scroll event.
   */
  const updateWithSteadyVelocity = (
    tracker: RVEngagedIndicesTrackerImpl,
    layoutManager: RVLayoutManager,
    offset: number,
    velocity: number
  ) => {
    const velocityObj: Velocity = { x: 0, y: velocity };
    tracker.updateScrollOffset(offset, velocityObj, layoutManager);
    tracker.updateScrollOffset(offset, velocityObj, layoutManager);
    tracker.updateScrollOffset(offset, velocityObj, layoutManager);
    return tracker.getEngagedIndices();
  };

  /**
   * Replicates the pre-clamp (unclamped) extended window math so the no-op
   * tests can assert the clamp does not change behavior when buffers already
   * cover the projection delta.
   */
  const getUnclampedEngagedIndices = (
    layoutManager: RVLayoutManager,
    offset: number,
    velocity: number,
    drawDistance: number,
    averageRenderTime: number
  ) => {
    const isScrollingBackward = velocity < 0;
    const viewportStart = offset + velocity * averageRenderTime;
    const viewportEnd = viewportStart + VIEWPORT_HEIGHT;
    const totalBuffer = drawDistance * 2;
    const bufferBefore = Math.ceil(
      totalBuffer * (isScrollingBackward ? 0.7 : 0.3)
    );
    const bufferAfter = Math.ceil(
      totalBuffer * (isScrollingBackward ? 0.3 : 0.7)
    );
    let extendedStart = Math.max(0, viewportStart - bufferBefore);
    const unusedStartBuffer = Math.max(0, bufferBefore - viewportStart);
    let extendedEnd = viewportEnd + bufferAfter + unusedStartBuffer;
    if (extendedEnd > CONTENT_SIZE) {
      const unusedEndBuffer = extendedEnd - CONTENT_SIZE;
      extendedEnd = CONTENT_SIZE;
      extendedStart = Math.max(0, extendedStart - unusedEndBuffer);
    }
    return layoutManager.getVisibleLayouts(extendedStart, extendedEnd);
  };

  describe("real viewport coverage with drawDistance 0", () => {
    // The bug only manifests when the projected offset crosses a row boundary
    // the real offset hasn't crossed yet, so sweep all phases modulo the row
    // height instead of probing a single offset.
    it.each([16, 32])(
      "engaged indices include the first really-visible row during a forward fling (averageRenderTime %d)",
      (averageRenderTime) => {
        const layoutManager = createTrackerLayoutManager();
        const uncoveredPhases: number[] = [];

        for (let phase = 0; phase < ROW_HEIGHT; phase++) {
          const offset = BASE_OFFSET + phase;
          const tracker = createTracker(0, averageRenderTime, "forward");
          const engaged = updateWithSteadyVelocity(
            tracker,
            layoutManager,
            offset,
            3 // px/ms fling
          );
          const visible = layoutManager.getVisibleLayouts(
            offset,
            offset + VIEWPORT_HEIGHT
          );
          if (
            engaged.startIndex > visible.startIndex ||
            engaged.endIndex < visible.endIndex
          ) {
            uncoveredPhases.push(phase);
          }
        }

        expect(uncoveredPhases).toEqual([]);
      }
    );

    it.each([16, 32])(
      "engaged indices include the last really-visible row during a backward fling (averageRenderTime %d)",
      (averageRenderTime) => {
        const layoutManager = createTrackerLayoutManager();
        const uncoveredPhases: number[] = [];

        for (let phase = 0; phase < ROW_HEIGHT; phase++) {
          const offset = BASE_OFFSET + phase;
          const tracker = createTracker(0, averageRenderTime, "backward");
          const engaged = updateWithSteadyVelocity(
            tracker,
            layoutManager,
            offset,
            -3 // px/ms fling
          );
          const visible = layoutManager.getVisibleLayouts(
            offset,
            offset + VIEWPORT_HEIGHT
          );
          if (
            engaged.startIndex > visible.startIndex ||
            engaged.endIndex < visible.endIndex
          ) {
            uncoveredPhases.push(phase);
          }
        }

        expect(uncoveredPhases).toEqual([]);
      }
    );
  });

  describe("no-op with default drawDistance", () => {
    // With the default drawDistance (250), the trailing buffer always covers
    // the projection delta at these velocities, so the viewport clamp must
    // not change the computed window at all.
    it.each([
      [16, 3],
      [16, -3],
      [32, 3],
      [32, -3],
      [16, 1.5],
      [16, -1.5],
    ])(
      "engaged indices match the unclamped window math (averageRenderTime %d, velocity %d)",
      (averageRenderTime, velocity) => {
        const layoutManager = createTrackerLayoutManager();
        const drawDistance = 250;
        const mismatchedPhases: number[] = [];

        for (let phase = 0; phase < ROW_HEIGHT; phase++) {
          const offset = BASE_OFFSET + phase;
          const tracker = createTracker(
            drawDistance,
            averageRenderTime,
            velocity < 0 ? "backward" : "forward"
          );
          const engaged = updateWithSteadyVelocity(
            tracker,
            layoutManager,
            offset,
            velocity
          );
          const expected = getUnclampedEngagedIndices(
            layoutManager,
            offset,
            velocity,
            drawDistance,
            averageRenderTime
          );
          if (!engaged.equals(expected)) {
            mismatchedPhases.push(phase);
          }
        }

        expect(mismatchedPhases).toEqual([]);
      }
    );
  });

  describe("boundary handling", () => {
    it("redistributes unused end buffer to the start at the end of the list", () => {
      const layoutManager = createTrackerLayoutManager();
      const maxOffset = CONTENT_SIZE - VIEWPORT_HEIGHT; // 8100
      const tracker = createTracker(250, 16, "forward");
      const engaged = updateWithSteadyVelocity(
        tracker,
        layoutManager,
        maxOffset,
        3
      );

      // Matches the unclamped math including end-boundary redistribution
      const expected = getUnclampedEngagedIndices(
        layoutManager,
        maxOffset,
        3,
        250,
        16
      );
      expect(engaged.equals(expected)).toBe(true);
      expect(engaged.endIndex).toBe(ITEM_COUNT - 1);
      // Without redistribution the window would start at
      // (8100 + 48) - 150 = 7998 => first row 90. Redistribution of the
      // 398px of unused end buffer extends the start to 7600 => first row 86.
      expect(engaged.startIndex).toBe(86);
    });

    it("does not produce a negative window start for negative offsets (overscroll)", () => {
      const layoutManager = createTrackerLayoutManager();
      const offset = -50;
      const tracker = createTracker(0, 16, "backward");
      const engaged = updateWithSteadyVelocity(
        tracker,
        layoutManager,
        offset,
        -3
      );

      // Window start must be clamped to 0 => first row engaged
      expect(engaged.startIndex).toBe(0);
      // And the really-visible part of the viewport [-50, 650] is covered
      const visible = layoutManager.getVisibleLayouts(
        offset,
        offset + VIEWPORT_HEIGHT
      );
      expect(engaged.endIndex).toBeGreaterThanOrEqual(visible.endIndex);
    });
  });
});
