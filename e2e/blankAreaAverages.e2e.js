const { by, device, element } = require("detox");

describe("Example", () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it("blanks averages", async () => {
    await element(by.id("Twitter Timeline")).tap();

    let i = 0;
    do {
      i += 1;
      const swipePercentage = Math.random();
      await element(by.id("RecyclerFlatList")).swipe(
        "up",
        "fast",
        swipePercentage
      );
    } while (i < 20);
  });
});
