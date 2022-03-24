import * as path from "path";
import * as fs from "fs";
import { Platform } from "react-native";
import {
  wipeArtifactsLocation,
  saveReference,
  referenceExists,
} from "./SnapshotLocation";

import { assertSnapshots, assertSnapshot } from "./SnapshotAsserts";

describe("FlashList", () => {
  const platform = device.getPlatform();
  const flatTwitterReferenceName = `Twitter_Flat_List_screenshot_${platform}.png`;

  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    wipeArtifactsLocation("diffs");
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it("Twitter with FlashList looks the same", async () => {
    // TODOs: Get it from Jest
    // expect.getState().currentTestName - doesn't  work
    const testName = "Twitter with FlashList looks the same";

    await element(by.id("Twitter Timeline")).tap();

    const testRunScreenshotPath = await element(
      by.id("FlashList")
    ).takeScreenshot(testName);

    if (referenceExists(testName)) {
      assertSnapshot(testRunScreenshotPath, testName);
    } else {
      saveReference(testRunScreenshotPath, testName);
    }
  });

  it("Twitter with FlatList looks the same as with FlashList", async () => {
    // TODOs: Get it from Jest
    // expect.getState().currentTestName - doesn't  work
    const testName = "Twitter with FlatList looks the same as with FlashList";

    await element(by.id("Twitter FlatList Timeline")).tap();

    const testRunScreenshotPath = await element(
      by.id("FlatList")
    ).takeScreenshot(flatTwitterReferenceName);

    if (!referenceExists(testName)) {
      saveReference(testRunScreenshotPath, testName);
    }

    const flashListReference = referenceExists(
      "Twitter with FlashList looks the same"
    );
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
