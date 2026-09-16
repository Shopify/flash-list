import {
  isSnappingList,
  supportsNativeMaintainVisibleContentPosition,
} from "../recyclerview/utils/snapping";
import { PlatformConfig } from "../native/config/PlatformHelper";

describe("isSnappingList", () => {
  // Mirrors ScrollView.js: pagingEnabled === true || snapToInterval != null ||
  // snapToOffsets != null. Anything looser or tighter would cover a different
  // set of lists than Android's native snapping path does.
  it.each([
    ["pagingEnabled snaps", { pagingEnabled: true }, true],
    ["snapToInterval snaps", { snapToInterval: 300 }, true],
    ["snapToOffsets snaps", { snapToOffsets: [0, 300] }, true],
    ["an empty snapToOffsets array still snaps", { snapToOffsets: [] }, true],
    ["a zero snapToInterval still snaps", { snapToInterval: 0 }, true],
    ["no snapping props does not snap", {}, false],
    ["pagingEnabled false does not snap", { pagingEnabled: false }, false],
    ["a null snapToInterval does not snap", { snapToInterval: null }, false],
    ["a null snapToOffsets does not snap", { snapToOffsets: null }, false],
  ])("%s", (_label, props, expected) => {
    expect(isSnappingList(props)).toBe(expected);
  });
});

describe("supportsNativeMaintainVisibleContentPosition", () => {
  const setPlatform = (nativeMvcpBreaksSnapFling: boolean) => {
    (
      PlatformConfig as unknown as { nativeMvcpBreaksSnapFling: boolean }
    ).nativeMvcpBreaksSnapFling = nativeMvcpBreaksSnapFling;
  };

  afterEach(() => {
    setPlatform(false);
  });

  it("withholds the native prop from a snapping list on Android", () => {
    setPlatform(true);

    expect(
      supportsNativeMaintainVisibleContentPosition({ snapToInterval: 300 })
    ).toBe(false);
    expect(
      supportsNativeMaintainVisibleContentPosition({ pagingEnabled: true })
    ).toBe(false);
    expect(
      supportsNativeMaintainVisibleContentPosition({ snapToOffsets: [0, 300] })
    ).toBe(false);
  });

  it("keeps the native prop for a list that does not snap on Android", () => {
    setPlatform(true);

    expect(supportsNativeMaintainVisibleContentPosition({})).toBe(true);
  });

  it("keeps the native prop on platforms whose fling survives a re-anchor", () => {
    setPlatform(false);

    expect(
      supportsNativeMaintainVisibleContentPosition({ snapToInterval: 300 })
    ).toBe(true);
    expect(supportsNativeMaintainVisibleContentPosition({})).toBe(true);
  });
});
