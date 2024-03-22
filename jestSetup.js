jest.mock("@shopify/flash-list", () => {
  const ActualFlashList = jest.requireActual("@shopify/flash-list").FlashList;
  class MockFlashList extends ActualFlashList {
    componentDidMount() {
      super.componentDidMount();
      this.rlvRef?._scrollComponent?._scrollViewRef?.props.onLayout({
        nativeEvent: { layout: { height: 900, width: 400 } },
      });
    }
  }
  return {
    ...jest.requireActual("@shopify/flash-list"),
    FlashList: MockFlashList,
    AnimatedFlashList: MockFlashList,
  };
});
