import * as path from "path";
import { ensureArtifactsLocation, saveDiff } from "./SnapshotLocation";

import { pixelDifference } from "./PixelDifference";

export const assertSnapshot = (snapshotPath: string, testName: string) => {
  const testArtifactsLocation = ensureArtifactsLocation(testName);
  const referenceName = path.resolve(testArtifactsLocation, `${testName}.png`);

  const diffPNG = pixelDifference(snapshotPath, referenceName);

  if (diffPNG !== null) {
    saveDiff(diffPNG, `${testName}_diff`);

    throw new Error(
      "There is difference between reference screenshot and test run screenshot"
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
    saveDiff(diffPNG, `${testName}_diff.png`);

    throw new Error(
      "There is difference between reference screenshot and test run screenshot"
    );
  }
};
