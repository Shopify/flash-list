import { saveDiff, reference, saveReference } from "./SnapshotLocation";
import { pixelDifference } from "./PixelDifference";

export const assertSnapshot = (snapshotPath: string, testName: string) => {
  const referencePath = reference(testName);

  if (referencePath) {
    const diffPNG = pixelDifference(snapshotPath, referencePath);

    if (diffPNG !== null) {
      const diffPath = saveDiff(diffPNG, `${testName}_diff.png`);

      throw Error(
        `There is difference between reference screenshot and test run screenshot.
         See diff: ${diffPath}`
      );
    }
  } else {
    saveReference(snapshotPath, testName);

    throw Error(
      `There is no reference screenshot present.
       New reference screenshot was just created for test name "${testName}".
       Please run the test again.`
    );
  }
};

export const assertSnapshotsEqual = (
  firstPath: string | null,
  secondPath: string | null,
  testName: string
) => {
  if (!firstPath) {
    throw new Error(
      `Invalid path: ${firstPath}. Please make sure that you have a screenshot before running this assertion.`
    );
  }

  if (!secondPath) {
    throw new Error(
      `Invalid path: ${secondPath}. Please make sure that you have a screenshot before running this assertion.`
    );
  }

  const diffPNG = pixelDifference(firstPath, secondPath);

  if (diffPNG !== null) {
    const diffPath = saveDiff(diffPNG, `${testName}_diff.png`);

    throw Error(
      `There is difference between reference screenshot and test run screenshot.
       See diff: ${diffPath}.
       Original screenshots: ${firstPath} and ${secondPath}`
    );
  }
};
