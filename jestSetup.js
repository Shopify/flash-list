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

jest.mock("@shopify/flash-list/dist/recyclerview/utils/measureLayout", () => {
  const originalModule = jest.requireActual(
    "@shopify/flash-list/dist/recyclerview/utils/measureLayout"
  );
  return {
    ...originalModule,
    measureParentSize: jest.fn().mockImplementation(() => ({
      x: 0,
      y: 0,
      width: 400,
      height: 900,
    })),
    measureFirstChildLayout: jest.fn().mockImplementation(() => ({
      x: 0,
      y: 0,
      width: 400,
      height: 900,
    })),
    measureItemLayout: jest.fn().mockImplementation(() => ({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    })),
  };
});
