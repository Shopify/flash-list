jest.mock("@shopify/flash-list", () => {
  const ActualFlashList = jest.requireActual("@shopify/flash-list").FlashList;
  class MockFlashList extends ActualFlashList {
    componentDidMount() {
      super.componentDidMount();
      this.getNativeScrollRef().props.onLayout({
        nativeEvent: { layout: { height: 900, width: 400 } },
      });
    }
  }
  return {
    ...jest.requireActual("@shopify/flash-list"),
    FlashList: MockFlashList,
  };
});
