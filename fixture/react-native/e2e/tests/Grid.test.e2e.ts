import goBack from "../utils/goBack";
import { assertSnapshot } from "../utils/SnapshotAsserts";
import { wipeArtifactsLocation } from "../utils/SnapshotLocation";

describe("Grid", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    wipeArtifactsLocation("diffs");
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    // Navigate to Grid screen
    await element(by.id("Grid")).tap();
  });

  afterEach(async () => {
    await goBack();
  });

  it("renders the grid correctly", async () => {
    // Capture the grid
    const gridTestName = "Grid_initial_render";
    const gridScreenshotPath = await element(
      by.id("GridScreen")
    ).takeScreenshot(gridTestName);
    assertSnapshot(gridScreenshotPath, gridTestName);
  });
});
