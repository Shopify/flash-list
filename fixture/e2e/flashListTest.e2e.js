const fs = require("fs");
const path = require("path");

import { pixelDifference, setDemoMode } from "./DetoxHelpers";

const ROOT_PATH = path.resolve(__dirname, "..");
const artifactsLocation = path.resolve(ROOT_PATH, "e2e/artifacts");
const flashTwitterName = "Twitter_Flash_List_screenshot_iOS_15_iPhone_11";
const flatTwitterScreenshotName =
  "Twitter_Flat_List_screenshot_iOS_15_iPhone_11";

const referenceScreenshotPath = (name: String) => {
  return path.resolve(artifactsLocation, `${name}.png`);
};

describe("FlashList", () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await setDemoMode();
  });

  it("Twitter with FlashList looks the same", async () => {
    await element(by.id("Twitter Timeline")).tap();

    const testScreenshotPath = await element(by.id("FlashList")).takeScreenshot(
      flashTwitterName
    );

    const referencePath = referenceScreenshotPath(flashTwitterName);

    if (fs.existsSync(referencePath)) {
      const numDiffPixels = pixelDifference(testScreenshotPath, referencePath);
      expect(numDiffPixels).toBe(0);
    } else {
      // Save reference screenshot cause it doesn't exist yet
      fs.rename(testRunScreenshotPath, referencePath, function (err) {
        if (err) throw err;
      });
    }
  });

  it("Twitter with FlatList looks the same as with FlashList", async () => {
    await element(by.id("Twitter FlatList Timeline")).tap();

    const testRunScreenshotPath = await element(
      by.id("FlatList")
    ).takeScreenshot(flatTwitterScreenshotName);

    const referencePath = referenceScreenshotPath(flatTwitterScreenshotName);

    if (!fs.existsSync(referencePath)) {
      // Save reference screenshot cause it doesn't exist yet
      fs.rename(testRunScreenshotPath, referencePath, function (err) {
        if (err) throw err;
      });
    }

    if (fs.existsSync(referenceScreenshotPath(flashTwitterName))) {
      const numDiffPixels = pixelDifference(
        testRunScreenshotPath,
        referenceScreenshotPath(flashTwitterName)
      );

      expect(numDiffPixels).toBe(0);
    } else {
      throw new Error(
        "Reference screenshot for FlashList example doesn't exist"
      );
    }
  });
});
