import goBack from "../utils/goBack";
import { assertSnapshot } from "../utils/SnapshotAsserts";
import { wipeArtifactsLocation } from "../utils/SnapshotLocation";

describe("Carousel", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    wipeArtifactsLocation("diffs");
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    // Navigate to Carousel screen
    await element(by.id("Carousel")).tap();
  });

  afterEach(async () => {
    await goBack();
  });

  it("handles orientation changes correctly", async () => {
    // Capture initial portrait state
    const portraitTestName = "Carousel_portrait";
    await device.setOrientation("portrait");

    const portraitScreenshotPath = await element(
      by.id("CarouselScreen")
    ).takeScreenshot(portraitTestName);
    assertSnapshot(portraitScreenshotPath, portraitTestName);

    // Change to landscape and capture
    const landscapeTestName = "Carousel_landscape";
    await device.setOrientation("landscape");

    const landscapeScreenshotPath = await element(
      by.id("CarouselScreen")
    ).takeScreenshot(landscapeTestName);
    assertSnapshot(landscapeScreenshotPath, landscapeTestName);

    // Change back to portrait and capture again
    const portraitAgainTestName = "Carousel_back_to_portrait";
    await device.setOrientation("portrait");
    const portraitAgainScreenshotPath = await element(
      by.id("CarouselScreen")
    ).takeScreenshot(portraitAgainTestName);
    assertSnapshot(portraitAgainScreenshotPath, portraitAgainTestName);
  });
});
