import goBack from "../utils/goBack";
import { assertSnapshot } from "../utils/SnapshotAsserts";
import { wipeArtifactsLocation } from "../utils/SnapshotLocation";

describe("InvertedTest", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    wipeArtifactsLocation("diffs");
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await element(by.id("Inverted Test")).tap();
  });

  afterEach(async () => {
    await goBack();
  });

  it("initial state with inverted items, header, footer, and separators", async () => {
    const testName = "InvertedTest_initial_state";
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const screenshotPath = await element(by.id("InvertedTestScreen"))
      .atIndex(0)
      .takeScreenshot(testName);
    assertSnapshot(screenshotPath, testName);
  });

  it("empty state with ListEmptyComponent", async () => {
    const testName = "InvertedTest_empty_state";
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await element(by.id("ShowEmpty")).tap();
    await new Promise((resolve) => setTimeout(resolve, 500));
    const screenshotPath = await element(by.id("InvertedTestScreen"))
      .atIndex(0)
      .takeScreenshot(testName);
    assertSnapshot(screenshotPath, testName);
  });

  it("sticky headers in inverted list", async () => {
    const testName = "InvertedTest_sticky_headers";
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await element(by.id("ShowSticky")).tap();
    await new Promise((resolve) => setTimeout(resolve, 500));
    const screenshotPath = await element(by.id("InvertedTestScreen"))
      .atIndex(0)
      .takeScreenshot(testName);
    assertSnapshot(screenshotPath, testName);
  });
});
