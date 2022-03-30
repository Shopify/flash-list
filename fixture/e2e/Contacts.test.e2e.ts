import goBack from "./utils/goBack";
import { assertSnapshot, assertSnapshotsEqual } from "./utils/SnapshotAsserts";
import { wipeArtifactsLocation } from "./utils/SnapshotLocation";

describe("Contacts", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    wipeArtifactsLocation("diffs");
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it("with FlashList and SectionList look the same", async () => {
    const testName = "Contacts with FlashList looks the same";
    const flashListTestName = `FlashList ${testName}`;
    // Go to contacts with FlashList
    await element(by.id("Contacts")).tap();

    const flashListScreenshotPath = await element(
      by.id("FlashList")
    ).takeScreenshot(flashListTestName);

    assertSnapshot(flashListScreenshotPath, flashListTestName);

    await goBack();

    // Go to contacts with SectionList
    await element(by.id("SectionLit")).tap();

    const sectionListTestName = `SectionList ${testName}`;

    const sectionListScreenshotPath = await element(
      by.id("SectionList")
    ).takeScreenshot(flashListTestName);

    assertSnapshotsEqual(
      flashListScreenshotPath,
      sectionListScreenshotPath,
      sectionListTestName
    );
  });
});
