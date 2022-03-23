const fs = require("fs");
const path = require("path");

import { Platform } from "react-native";
import {
  pixelDifference,
  setDemoMode,
  ensureArtifactsLocation,
  wipeArtifactsLocation,
} from "./DetoxHelpers";

describe("FlashList", () => {
  const platform = device.getPlatform();

  const flashTwitterReferenceName = `Twitter_Flash_List_screenshot_${platform}.png`;
  const flatTwitterReferenceName = `Twitter_Flat_List_screenshot_${platform}.png`;

  beforeAll(async () => {
    await device.launchApp({ newInstance: true });

    wipeArtifactsLocation("diffs", platform);
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it("Twitter with FlashList looks the same", async () => {
    const testArtifactsLocation = ensureArtifactsLocation(
      `twitter_with_flash_list`,
      platform
    );

    await element(by.id("Twitter Timeline")).tap();

    // Raw Path to just created screenshot
    const testRunScreenshotPath = await element(
      by.id("FlashList")
    ).takeScreenshot(flashTwitterReferenceName);

    // Path where we want to save the screenshot
    const flatListReferencePath = path.resolve(
      testArtifactsLocation,
      flashTwitterReferenceName
    );

    // If reference is already there, compare the two screenshots
    if (fs.existsSync(flatListReferencePath)) {
      console.log(`testRunScreenshotPath ${testRunScreenshotPath}`);
      console.log(`flatListReferencePath ${flatListReferencePath}`);
      // compare screenshots, get difference
      const diffPNG = pixelDifference(
        testRunScreenshotPath,
        flatListReferencePath
      );

      // If there is difference, fail the test
      if (diffPNG !== null) {
        saveDiff(diffPNG, "flash_twitter_looks_the_same_diff", platform);

        throw new Error(
          "There is difference between reference screenshot and test run screenshot"
        );
      }
    } else {
      // Save reference screenshot cause it doesn't exist yet
      fs.renameSync(
        testRunScreenshotPath,
        flatListReferencePath,
        function (err) {
          if (err) throw err;
        }
      );
      console.log("Reference screenshot created");
    }
  });

  it("Twitter with FlatList looks the same as with FlashList", async () => {
    const testArtifactsLocation = ensureArtifactsLocation(
      `flat_list_vs_flash_list`,
      platform
    );

    const flashTwitterReferenceLocation = ensureArtifactsLocation(
      `twitter_with_flash_list`,
      platform
    );

    await element(by.id("Twitter FlatList Timeline")).tap();

    const testRunScreenshotPath = await element(
      by.id("FlatList")
    ).takeScreenshot(flatTwitterReferenceName);

    const flatListReferencePath = path.resolve(
      testArtifactsLocation,
      flatTwitterReferenceName
    );

    const flashTwitterReferencePath = path.resolve(
      flashTwitterReferenceLocation,
      flashTwitterReferenceName
    );

    // If reference doesn't exist yet, save it
    if (!fs.existsSync(flatListReferencePath)) {
      fs.renameSync(
        testRunScreenshotPath,
        flatListReferencePath,
        function (err) {
          if (err) throw err;
        }
      );
    }

    // If FlashList reference exists, compare it with current FlatList screenshot
    if (fs.existsSync(flashTwitterReferencePath)) {
      const diffPNG = pixelDifference(
        flatListReferencePath,
        flashTwitterReferencePath
      );

      // If there is difference, fail the test
      if (diffPNG !== null) {
        saveDiff(diffPNG, "flat_list_vs_flash_list_diff", platform);

        throw new Error(
          "There is difference between reference screenshot and test run screenshot."
        );
      }
    } else {
      throw new Error(
        "Reference screenshot for FlashList example doesn't exist"
      );
    }
  });
});

const saveDiff = (diff, testName, platform) => {
  const diffsLocation = ensureArtifactsLocation(`diffs`, platform);
  const diffPath = path.resolve(diffsLocation, testName);
  fs.writeFileSync(diffPath, PNG.sync.write(diff));
};
