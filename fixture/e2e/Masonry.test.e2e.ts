import { assertSnapshot } from "./utils/SnapshotAsserts";
import { wipeArtifactsLocation } from "./utils/SnapshotLocation";

describe("Masonry", () => {
  const testNameLoad = "Masonry_with_FlashList_can_load";
  const testNameScroll = "Masonry_with_FlashList_can_scroll";

  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    wipeArtifactsLocation("diffs");
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await device.setOrientation("portrait");
  });

  it("can render columns correctly", async () => {
    await element(by.id("Masonry")).tap();

    const testRunScreenshotPath = await element(
      by.id("MasonryList")
    ).takeScreenshot(testNameLoad);

    assertSnapshot(testRunScreenshotPath, testNameLoad);
  });
  it("can scroll", async () => {
    await element(by.id("Masonry")).tap();
    await element(by.id("MasonryList")).scroll(2000, "down");
    const testRunScreenshotPath = await element(
      by.id("MasonryList")
    ).takeScreenshot(testNameScroll);

    assertSnapshot(testRunScreenshotPath, testNameScroll);
  });
});
