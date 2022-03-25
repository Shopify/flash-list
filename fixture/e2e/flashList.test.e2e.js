import * as path from "path";
import * as fs from "fs";
import { Platform } from "react-native";
import {
  wipeArtifactsLocation,
  saveReference,
  referenceExists,
} from "../src/Detox/SnapshotLocation";

import {
  assertSnapshotsEqual,
  assertSnapshot,
} from "../src/Detox/SnapshotAsserts";

describe("FlashList", () => {
  const flashListReferenceTestName = "Twitter with FlashList looks the same";

  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    wipeArtifactsLocation("diffs");
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it("Twitter with FlashList looks the same", async () => {
    await element(by.id("Twitter Timeline")).tap();

    const testRunScreenshotPath = await element(
      by.id("FlashList")
    ).takeScreenshot(flashListReferenceTestName);

    assertSnapshot(testRunScreenshotPath, flashListReferenceTestName);
  });

  it("Twitter with FlatList looks the same as with FlashList", async () => {
    // TODOs: Get it from Jest
    // expect.getState().currentTestName - doesn't  work
    const testName = "Twitter with FlatList looks the same as with FlashList";

    await element(by.id("Twitter FlatList Timeline")).tap();

    const testRunScreenshotPath = await element(
      by.id("FlatList")
    ).takeScreenshot(testName);

    // Assert that FlatList reference is the same
    assertSnapshot(testRunScreenshotPath, testName);

    // Assert that FlatList reference is the same as with FlashList
    assertSnapshotsEqual(
      referenceExists(flashListReferenceTestName),
      referenceExists(testName),
      testName
    );
  });
});
