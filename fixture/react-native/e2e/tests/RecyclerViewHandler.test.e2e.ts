import goBack from "../utils/goBack";
import { assertSnapshot } from "../utils/SnapshotAsserts";
import { wipeArtifactsLocation } from "../utils/SnapshotLocation";

describe("RecyclerViewHandler", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    wipeArtifactsLocation("diffs");
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    // Navigate to RecyclerViewHandlerTest screen
    await element(by.id("RecyclerView Handler Test")).tap();
  });

  afterEach(async () => {
    await goBack();
  });

  it("renders initial list correctly", async () => {
    const testName = "RecyclerView_initial_state";
    const screenshotPath = await element(by.id("RecyclerView")).takeScreenshot(
      testName
    );

    assertSnapshot(screenshotPath, testName);
  });

  it("scrolls to specific index", async () => {
    // Tap scroll to index 20
    await element(by.text("Scroll to Index 20")).tap();

    // Capture the scrolled state
    const scrolledTestName = "RecyclerView_after_scroll_to_index";
    const scrolledScreenshotPath = await element(
      by.id("RecyclerView")
    ).takeScreenshot(scrolledTestName);
    assertSnapshot(scrolledScreenshotPath, scrolledTestName);
  });

  it("scrolls to end", async () => {
    // Tap scroll to end
    await element(by.text("Scroll to End")).tap();

    // Capture the scrolled state
    const scrolledTestName = "RecyclerView_after_scroll_to_end";
    const scrolledScreenshotPath = await element(
      by.id("RecyclerView")
    ).takeScreenshot(scrolledTestName);
    assertSnapshot(scrolledScreenshotPath, scrolledTestName);
  });

  it("clears and resets items", async () => {
    // Tap clear items
    await element(by.text("Clear Items")).tap();

    // Capture the empty state
    const emptyTestName = "RecyclerView_empty_state";
    const emptyScreenshotPath = await element(
      by.id("RecyclerView")
    ).takeScreenshot(emptyTestName);
    assertSnapshot(emptyScreenshotPath, emptyTestName);

    // Reset items
    await element(by.text("Reset Items")).tap();

    // Capture the reset state
    const resetTestName = "RecyclerView_reset_state";
    const resetScreenshotPath = await element(
      by.id("RecyclerView")
    ).takeScreenshot(resetTestName);
    assertSnapshot(resetScreenshotPath, resetTestName);
  });

  it("taps on an item to scroll to it", async () => {
    // First scroll down to see more items
    await element(by.text("Scroll to Index 20")).tap();

    // Tap on a visible item
    await element(by.text("Item 20")).tap();

    // Capture the state after tapping the item
    const tapItemTestName = "RecyclerView_after_tap_item";
    const tapItemScreenshotPath = await element(
      by.id("RecyclerView")
    ).takeScreenshot(tapItemTestName);
    assertSnapshot(tapItemScreenshotPath, tapItemTestName);
  });
});
