import goBack from "../utils/goBack";
import { assertSnapshot } from "../utils/SnapshotAsserts";
import { wipeArtifactsLocation } from "../utils/SnapshotLocation";

describe("ChatInverted", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    wipeArtifactsLocation("diffs");
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    // Navigate to Chat (Inverted) screen
    await element(by.id("Chat (Inverted)")).tap();
  });

  afterEach(async () => {
    await goBack();
  });

  it("initial state with inverted list", async () => {
    const testName = "ChatInverted_initial_state";
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const screenshotPath = await element(by.id("ChatInvertedScreen"))
      .atIndex(0)
      .takeScreenshot(testName);
    assertSnapshot(screenshotPath, testName);
  });

  it("load older messages", async () => {
    const testName = "ChatInverted_load_older";
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await element(by.text("Load Older")).tap();
    await new Promise((resolve) => setTimeout(resolve, 500));
    const screenshotPath = await element(by.id("ChatInvertedScreen"))
      .atIndex(0)
      .takeScreenshot(testName);
    assertSnapshot(screenshotPath, testName);
  });

  it("add new message", async () => {
    const testName = "ChatInverted_new_message";
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await element(by.text("New Message")).tap();
    await new Promise((resolve) => setTimeout(resolve, 500));
    const screenshotPath = await element(by.id("ChatInvertedScreen"))
      .atIndex(0)
      .takeScreenshot(testName);
    assertSnapshot(screenshotPath, testName);
  });
});
