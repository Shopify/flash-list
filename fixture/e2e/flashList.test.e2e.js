const fs = require("fs");
const path = require("path");

import { Platform } from "react-native";
import { pixelDifference, setDemoMode } from "./DetoxHelpers";

const ROOT_PATH = path.resolve(__dirname, "..");
const artifactsLocation = path.resolve(
  ROOT_PATH,
  `e2e/artifacts/${Platform.OS}`
);
const flashTwitterReferenceName = `Twitter_Flash_List_screenshot_${Platform.OS}`;
const flatTwitterReferenceName = `Twitter_Flat_List_screenshot_${Platform.OS}`;

const flashTwitterReferenceLocation = path.resolve(
  artifactsLocation,
  `flash_twitter_looks_the_same`
);

const diffLocation = (name: String) => {
  return path.resolve(artifactsLocation, `diffs`, name);
};

describe("FlashList", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it("should have examples screen", async () => {
    await expect(element(by.id("ExamplesFlatList"))).toBeVisible();
  });

  it("Twitter with FlashList looks the same", async () => {
    await element(by.id("Twitter Timeline")).tap();

    const testRunScreenshotPath = await element(
      by.id("FlashList")
    ).takeScreenshot(flashTwitterReferenceName);

    const referencePath = path.resolve(
      flashTwitterReferenceLocation,
      `${flashTwitterReferenceName}.png`
    );

    if (fs.existsSync(referencePath)) {
      const numDiffPixels = pixelDifference(
        testRunScreenshotPath,
        referencePath
      );

      if (numDiffPixels > 0) {
        /* TODOs: Write diff to file
        fs.writeFileSync(
          diffLocation("flash_twitter_looks_the_same_diff"),
          PNG.sync.write(diff)
        );*/
        throw new Error(
          "There is difference between reference screenshot and test run screenshot"
        );
      }
    } else {
      if (!fs.existsSync(flashTwitterReferenceLocation)) {
        fs.mkdirSync(flashTwitterReferenceLocation, { recursive: true });
      }
      // Save reference screenshot cause it doesn't exist yet
      fs.renameSync(testRunScreenshotPath, referencePath, function (err) {
        if (err) throw err;
      });
      console.log("Reference screenshot created");
    }
  });

  it("Twitter with FlatList looks the same as with FlashList", async () => {
    const testRunArtifactsLocation = path.resolve(
      artifactsLocation,
      `flat_list_vs_flash_list`
    );

    await element(by.id("Twitter FlatList Timeline")).tap();

    const testRunScreenshotPath = await element(
      by.id("FlatList")
    ).takeScreenshot(flatTwitterReferenceName);

    const flatTwitterReferencePath = path.resolve(
      testRunArtifactsLocation,
      `${flatTwitterReferenceName}.png`
    );

    const flashTwitterReferencePath = path.resolve(
      flashTwitterReferenceLocation,
      `${flashTwitterReferenceName}.png`
    );

    if (!fs.existsSync(flatTwitterReferencePath)) {
      if (!fs.existsSync(testRunArtifactsLocation)) {
        fs.mkdirSync(testRunArtifactsLocation, { recursive: true });
      }

      fs.renameSync(
        testRunScreenshotPath,
        flatTwitterReferencePath,
        function (err) {
          if (err) throw err;
        }
      );
    }

    if (fs.existsSync(flashTwitterReferencePath)) {
      const numDiffPixels = pixelDifference(
        flatTwitterReferencePath,
        flashTwitterReferencePath
      );

      if (numDiffPixels > 0) {
        /* TODOs: Write diff to file
        const diffLocation = path.resolve(
          ROOT_PATH,
          "e2e/artifacts/flat_list_vs_flash_list_diff.png"
        );
        fs.writeFileSync(diffLocation, PNG.sync.write(diff));*/

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
