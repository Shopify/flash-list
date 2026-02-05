import React from "react";
import { Text, View } from "react-native";
import "@quilted/react-testing/matchers";
import { render } from "@quilted/react-testing";

import { FlashList } from "..";

// Mock measureLayout to return fixed dimensions
jest.mock("../recyclerview/utils/measureLayout", () => {
  const originalModule = jest.requireActual(
    "../recyclerview/utils/measureLayout"
  );
  return {
    ...originalModule,
    measureParentSize: jest.fn().mockImplementation(() => ({
      x: 0,
      y: 0,
      width: 399,
      height: 899,
    })),
    measureFirstChildLayout: jest.fn().mockImplementation(() => ({
      x: 0,
      y: 0,
      width: 399,
      height: 899,
    })),
    measureItemLayout: jest.fn().mockImplementation(() => ({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    })),
  };
});

const testData = [1, 2, 3, 4, 5];

const LoadingIndicator = () => <Text testID="loading-indicator">Loading...</Text>;
const EmptyComponent = () => <Text testID="empty-component">No items</Text>;
const HeaderComponent = () => <Text testID="header-component">Header</Text>;
const FooterComponent = () => <Text testID="footer-component">Footer</Text>;

describe("LoadingComponent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  it("renders LoadingComponent when isLoading is true", () => {
    const result = render(
      <FlashList
        data={testData}
        isLoading={true}
        LoadingComponent={<LoadingIndicator />}
        renderItem={({ item }) => <Text testID={`item-${item}`}>{item}</Text>}
      />
    );

    // Loading component should be visible
    expect(result).toContainReactComponent(Text, {
      testID: "loading-indicator",
    });

    // List items should not be rendered
    expect(result).not.toContainReactComponent(Text, { testID: "item-1" });
  });

  it("does not render LoadingComponent when isLoading is false", () => {
    const result = render(
      <FlashList
        data={testData}
        isLoading={false}
        LoadingComponent={<LoadingIndicator />}
        renderItem={({ item }) => <Text testID={`item-${item}`}>{item}</Text>}
      />
    );

    // Loading component should not be visible
    expect(result).not.toContainReactComponent(Text, {
      testID: "loading-indicator",
    });

    // List items should be rendered
    expect(result).toContainReactComponent(Text, { testID: "item-1" });
  });

  it("does not render LoadingComponent when isLoading is undefined", () => {
    const result = render(
      <FlashList
        data={testData}
        LoadingComponent={<LoadingIndicator />}
        renderItem={({ item }) => <Text testID={`item-${item}`}>{item}</Text>}
      />
    );

    // Loading component should not be visible
    expect(result).not.toContainReactComponent(Text, {
      testID: "loading-indicator",
    });

    // List items should be rendered
    expect(result).toContainReactComponent(Text, { testID: "item-1" });
  });

  it("LoadingComponent takes precedence over ListEmptyComponent", () => {
    const result = render(
      <FlashList
        data={[]}
        isLoading={true}
        LoadingComponent={<LoadingIndicator />}
        ListEmptyComponent={<EmptyComponent />}
        renderItem={({ item }) => <Text testID={`item-${item}`}>{item}</Text>}
      />
    );

    // Loading component should be visible
    expect(result).toContainReactComponent(Text, {
      testID: "loading-indicator",
    });

    // Empty component should not be visible
    expect(result).not.toContainReactComponent(Text, {
      testID: "empty-component",
    });
  });

  it("shows ListEmptyComponent when isLoading is false and data is empty", () => {
    const result = render(
      <FlashList
        data={[]}
        isLoading={false}
        LoadingComponent={<LoadingIndicator />}
        ListEmptyComponent={<EmptyComponent />}
        renderItem={({ item }) => <Text testID={`item-${item}`}>{item}</Text>}
      />
    );

    // Loading component should not be visible
    expect(result).not.toContainReactComponent(Text, {
      testID: "loading-indicator",
    });

    // Empty component should be visible
    expect(result).toContainReactComponent(Text, {
      testID: "empty-component",
    });
  });

  it("renders header and footer even when loading", () => {
    const result = render(
      <FlashList
        data={testData}
        isLoading={true}
        LoadingComponent={<LoadingIndicator />}
        ListHeaderComponent={<HeaderComponent />}
        ListFooterComponent={<FooterComponent />}
        renderItem={({ item }) => <Text testID={`item-${item}`}>{item}</Text>}
      />
    );

    // Loading component should be visible
    expect(result).toContainReactComponent(Text, {
      testID: "loading-indicator",
    });

    // Header should be visible
    expect(result).toContainReactComponent(Text, {
      testID: "header-component",
    });

    // Footer should be visible
    expect(result).toContainReactComponent(Text, {
      testID: "footer-component",
    });

    // List items should not be rendered
    expect(result).not.toContainReactComponent(Text, { testID: "item-1" });
  });

  it("accepts LoadingComponent as a component type", () => {
    const LoadingComponentType = () => (
      <View testID="loading-component-type">
        <Text>Loading from component type...</Text>
      </View>
    );

    const result = render(
      <FlashList
        data={testData}
        isLoading={true}
        LoadingComponent={LoadingComponentType}
        renderItem={({ item }) => <Text testID={`item-${item}`}>{item}</Text>}
      />
    );

    // Loading component should be visible
    expect(result).toContainReactComponent(View, {
      testID: "loading-component-type",
    });
  });

  it("accepts LoadingComponent as a React element", () => {
    const result = render(
      <FlashList
        data={testData}
        isLoading={true}
        LoadingComponent={
          <View testID="loading-component-element">
            <Text>Loading from element...</Text>
          </View>
        }
        renderItem={({ item }) => <Text testID={`item-${item}`}>{item}</Text>}
      />
    );

    // Loading component should be visible
    expect(result).toContainReactComponent(View, {
      testID: "loading-component-element",
    });
  });

  it("transitions from loading to showing items", () => {
    const result = render(
      <FlashList
        data={testData}
        isLoading={true}
        LoadingComponent={<LoadingIndicator />}
        renderItem={({ item }) => <Text testID={`item-${item}`}>{item}</Text>}
      />
    );

    // Initially loading
    expect(result).toContainReactComponent(Text, {
      testID: "loading-indicator",
    });
    expect(result).not.toContainReactComponent(Text, { testID: "item-1" });

    // Update to not loading
    result.setProps({
      data: testData,
      isLoading: false,
      LoadingComponent: <LoadingIndicator />,
      renderItem: ({ item }: { item: number }) => (
        <Text testID={`item-${item}`}>{item}</Text>
      ),
    });

    // Should now show items
    expect(result).not.toContainReactComponent(Text, {
      testID: "loading-indicator",
    });
    expect(result).toContainReactComponent(Text, { testID: "item-1" });
  });

  it("does not render anything when LoadingComponent is null and isLoading is true", () => {
    const result = render(
      <FlashList
        data={testData}
        isLoading={true}
        LoadingComponent={null}
        renderItem={({ item }) => <Text testID={`item-${item}`}>{item}</Text>}
      />
    );

    // No loading component
    expect(result).not.toContainReactComponent(Text, {
      testID: "loading-indicator",
    });

    // List items should not be rendered either
    expect(result).not.toContainReactComponent(Text, { testID: "item-1" });
  });

  it("works with horizontal lists", () => {
    const result = render(
      <FlashList
        data={testData}
        horizontal={true}
        isLoading={true}
        LoadingComponent={<LoadingIndicator />}
        renderItem={({ item }) => <Text testID={`item-${item}`}>{item}</Text>}
      />
    );

    // Loading component should be visible
    expect(result).toContainReactComponent(Text, {
      testID: "loading-indicator",
    });

    // List items should not be rendered
    expect(result).not.toContainReactComponent(Text, { testID: "item-1" });
  });
});
