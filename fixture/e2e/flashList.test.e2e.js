import * as path from "path";
import * as fs from "fs";
import { Platform } from "react-native";
import {
  wipeArtifactsLocation,
  saveReference,
  referenceExists,
} from "../src/Detox/SnapshotLocation";

import { assertSnapshots, assertSnapshot } from "../src/Detox/SnapshotAsserts";

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

    if (referenceExists(flashListReferenceTestName)) {
      assertSnapshot(testRunScreenshotPath, flashListReferenceTestName);
    } else {
      saveReference(testRunScreenshotPath, flashListReferenceTestName);
    }
  });

  it("Twitter with FlatList looks the same as with FlashList", async () => {
    // TODOs: Get it from Jest
    // expect.getState().currentTestName - doesn't  work
    const testName = "Twitter with FlatList looks the same as with FlashList";

    await element(by.id("Twitter FlatList Timeline")).tap();

    const testRunScreenshotPath = await element(
      by.id("FlatList")
    ).takeScreenshot(testName);

    if (!referenceExists(testName)) {
      saveReference(testRunScreenshotPath, testName);
    }

    const flashListReference = referenceExists(flashListReferenceTestName);
    const flatListReference = referenceExists(testName);

    if (flashListReference && flatListReference) {
      assertSnapshots(flatListReference, flashListReference, testName);
    } else {
      throw new Error(
        "One of the references doesn't exist. Please run the tests again."
      );
    }
  });
});
