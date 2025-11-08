/**
 * Tests for onEndReached behavior
 * Issue #1984: onEndReached should not be called automatically on initialization
 */
import React from "react";
import { View, Text } from "react-native";
import { render } from "@quilted/react-testing";
import { FlashList } from "../FlashList";

// Mock data for testing
const generateMockData = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    title: `Item ${i}`,
  }));

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

describe("onEndReached behavior", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  it("should not call onEndReached on initial render with short list", () => {
    const onEndReached = jest.fn();
    const data = generateMockData(5); // Short list

    render(
      <FlashList
        data={data}
        renderItem={({ item }) => (
          <View>
            <Text>{item.title}</Text>
          </View>
        )}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
      />
    );

    // onEndReached should NOT be called on initial render
    expect(onEndReached).not.toHaveBeenCalled();
  });

  it("should not call onEndReached on initial render with long list", () => {
    const onEndReached = jest.fn();
    const data = generateMockData(100); // Long list

    render(
      <FlashList
        data={data}
        renderItem={({ item }) => (
          <View>
            <Text>{item.title}</Text>
          </View>
        )}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
      />
    );

    // onEndReached should NOT be called on initial render
    expect(onEndReached).not.toHaveBeenCalled();
  });

  it("should not call onEndReached when data is updated without scrolling", () => {
    const onEndReached = jest.fn();
    const initialData = generateMockData(5);

    const wrapper = render(
      <FlashList
        data={initialData}
        renderItem={({ item }) => (
          <View>
            <Text>{item.title}</Text>
          </View>
        )}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
      />
    );

    // Update data
    const newData = generateMockData(10);
    wrapper.setProps({ data: newData });

    // onEndReached should still NOT be called after data update
    expect(onEndReached).not.toHaveBeenCalled();
  });

  it("should not call onStartReached on initial render", () => {
    const onStartReached = jest.fn();
    const data = generateMockData(100);

    render(
      <FlashList
        data={data}
        renderItem={({ item }) => (
          <View>
            <Text>{item.title}</Text>
          </View>
        )}
        onStartReached={onStartReached}
        onStartReachedThreshold={0.2}
      />
    );

    // onStartReached should NOT be called on initial render
    expect(onStartReached).not.toHaveBeenCalled();
  });

  it("should handle both onEndReached and onStartReached without calling them on mount", () => {
    const onEndReached = jest.fn();
    const onStartReached = jest.fn();
    const data = generateMockData(5); // Short list that fits in viewport

    render(
      <FlashList
        data={data}
        renderItem={({ item }) => (
          <View>
            <Text>{item.title}</Text>
          </View>
        )}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        onStartReached={onStartReached}
        onStartReachedThreshold={0.2}
      />
    );

    // Neither callback should be called on initial render
    expect(onEndReached).not.toHaveBeenCalled();
    expect(onStartReached).not.toHaveBeenCalled();
  });

  it("should not call onEndReached with different threshold values on mount", () => {
    const testThresholds = [0.1, 0.5, 0.9];

    testThresholds.forEach((threshold) => {
      const onEndReached = jest.fn();
      const data = generateMockData(5);

      render(
        <FlashList
          data={data}
          renderItem={({ item }) => (
            <View>
              <Text>{item.title}</Text>
            </View>
          )}
          onEndReached={onEndReached}
          onEndReachedThreshold={threshold}
        />
      );

      expect(onEndReached).not.toHaveBeenCalled();
    });
  });
});
