describe("Example", () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it("should have examples screen", async () => {
    await expect(element(by.id("ExamplesFlatList"))).toBeVisible();
  });
});
