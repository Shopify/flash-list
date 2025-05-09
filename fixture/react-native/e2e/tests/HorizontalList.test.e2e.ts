import goBack from "../utils/goBack";
import { assertSnapshot } from "../utils/SnapshotAsserts";
import { wipeArtifactsLocation } from "../utils/SnapshotLocation";

describe("HorizontalList", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    wipeArtifactsLocation("diffs");
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    // Navigate to HorizontalList screen
    await element(by.id("Horizontal List")).tap();
  });

  afterEach(async () => {
    await goBack();
  });

  it("renders horizontal list correctly", async () => {
    // Capture the initial state
    const initialTestName = "HorizontalList_initial_render";
    const initialScreenshotPath = await element(
      by.id("HorizontalListScreen")
    ).takeScreenshot(initialTestName);
    assertSnapshot(initialScreenshotPath, initialTestName);
  });
});
