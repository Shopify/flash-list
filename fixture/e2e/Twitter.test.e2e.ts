import { assertSnapshotsEqual, assertSnapshot } from "./utils/SnapshotAsserts";
import { wipeArtifactsLocation, reference } from "./utils/SnapshotLocation";

describe("Twitter", () => {
  const flashListReferenceTestName = "Twitter with FlashList looks the same";

  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    wipeArtifactsLocation("diffs");
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it("with FlashList looks the same", async () => {
    await element(by.id("Twitter Timeline")).tap();

    const testRunScreenshotPath = await element(
      by.id("FlashList")
    ).takeScreenshot(flashListReferenceTestName);

    assertSnapshot(testRunScreenshotPath, flashListReferenceTestName);
  });

  it("with FlatList looks the same as with FlashList", async () => {
    const testName = "Twitter with FlatList looks the same as with FlashList";

    await element(by.id("Twitter FlatList Timeline")).tap();

    const testRunScreenshotPath = await element(
      by.id("FlatList")
    ).takeScreenshot(testName);

    // Assert that FlatList reference is the same
    assertSnapshot(testRunScreenshotPath, testName);

    // Assert that FlatList reference is the same as with FlashList
    assertSnapshotsEqual(
      reference(flashListReferenceTestName),
      reference(testName),
      testName
    );
  });
});
