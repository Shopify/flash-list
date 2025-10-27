import { assertSnapshot } from "../utils/SnapshotAsserts";
import { wipeArtifactsLocation } from "../utils/SnapshotLocation";

describe("Contacts", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    wipeArtifactsLocation("diffs");
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it("with FlashList and SectionList look the same", async () => {
    const testName = "Contacts_with_FlashList_looks_the_same";
    const flashListTestName = `FlashList_${testName}`;
    // Go to contacts with FlashList
    await element(by.id("Contacts")).tap();

    const flashListScreenshotPath = await element(
      by.id("FlashList")
    ).takeScreenshot(flashListTestName);

    assertSnapshot(flashListScreenshotPath, flashListTestName);
  });
});
