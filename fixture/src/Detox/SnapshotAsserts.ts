import * as path from "path";
import { ensureArtifactsLocation, saveDiff } from "./SnapshotLocation";
import element from "detox";

import { pixelDifference } from "./PixelDifference";

export const assertSnapshot = (element: element, testName: string) => {
  const testRunScreenshotPath = element.takeScreenshot(testName);

  const testArtifactsLocation = ensureArtifactsLocation(testName);
  const referenceName = path.resolve(testArtifactsLocation, `${testName}.png`);

  const diffPNG = pixelDifference(snapshotPath, referenceName);

  if (diffPNG !== null) {
    const diffPath = saveDiff(diffPNG, `${testName}_diff`);

    throw new Error(
      `There is difference between reference screenshot and test run screenshot. See diff: ${diffPath}`
    );
  }
};

export const assertSnapshots = (
  firstPath: string,
  secondPath: string,
  testName: string
) => {
  const diffPNG = pixelDifference(firstPath, secondPath);

  if (diffPNG !== null) {
    const diffPath = saveDiff(diffPNG, `${testName}_diff.png`);

    throw new Error(
      `There is difference between reference screenshot and test run screenshot. See diff: ${diffPath}`
    );
  }
};
