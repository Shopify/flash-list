jest.mock("@shopify/flash-list", () => {
  const RecyclerView = jest.requireActual("@shopify/flash-list").RecyclerView;

  return {
    ...jest.requireActual("@shopify/flash-list"),
    FlashList: RecyclerView,
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
