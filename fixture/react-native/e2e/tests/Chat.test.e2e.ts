import goBack from "../utils/goBack";
import { assertSnapshot } from "../utils/SnapshotAsserts";
import { wipeArtifactsLocation } from "../utils/SnapshotLocation";

describe("Chat", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    wipeArtifactsLocation("diffs");
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    // Navigate to Chat screen
    await element(by.id("Chat")).tap();
  });

  afterEach(async () => {
    await goBack();
  });

  it("add messages at top and capture screenshot", async () => {
    // First capture the initial state
    const initialTestName = "Chat_initial_state";
    // add a delay to ensure the screen is loaded
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const initialScreenshotPath = await element(by.id("ChatScreen"))
      .atIndex(0)
      .takeScreenshot(initialTestName);
    assertSnapshot(initialScreenshotPath, initialTestName);

    // Add messages at the top
    await element(by.text("Add at Top")).tap();

    // Capture screenshot after adding at top
    const topMessagesTestName = "Chat_add_at_top";
    const topMessagesScreenshotPath = await element(by.id("ChatScreen"))
      .atIndex(0)
      .takeScreenshot(topMessagesTestName);
    assertSnapshot(topMessagesScreenshotPath, topMessagesTestName);
  });

  it("add messages at bottom and capture screenshot", async () => {
    // First capture the initial state
    const initialTestName = "Chat_before_adding_bottom";
    const initialScreenshotPath = await element(by.id("ChatScreen"))
      .atIndex(0)
      .takeScreenshot(initialTestName);
    assertSnapshot(initialScreenshotPath, initialTestName);

    // Add message at the bottom
    await element(by.text("Add at Bottom")).tap();

    // Capture screenshot after adding at bottom
    const bottomMessagesTestName = "Chat_add_at_bottom";
    const bottomMessagesScreenshotPath = await element(by.id("ChatScreen"))
      .atIndex(0)
      .takeScreenshot(bottomMessagesTestName);
    assertSnapshot(bottomMessagesScreenshotPath, bottomMessagesTestName);
  });
});
