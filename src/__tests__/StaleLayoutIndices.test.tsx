import React from "react";
import { Text, View } from "react-native";
import "@quilted/react-testing/matchers";
import { render } from "@quilted/react-testing";

import { FlashList } from "..";

/**
 * A render stack entry, or a native onLayout callback in flight, can outlive the
 * layout table row it was created for. Reading that row used to throw
 * "index out of bounds, not enough layouts" and take the tree down with it.
 */

let mockItemHeight = 100;
jest.mock("../recyclerview/utils/measureLayout", () => {
  const originalModule = jest.requireActual(
    "../recyclerview/utils/measureLayout"
  );
  return {
    ...originalModule,
    measureParentSize: jest.fn(() => ({ width: 399, height: 899 })),
    measureFirstChildLayout: jest.fn(() => ({
      x: 0,
      y: 0,
      width: 399,
      height: 899,
    })),
    measureItemLayout: jest.fn(() => ({
      x: 0,
      y: 0,
      width: 399,
      height: mockItemHeight,
    })),
  };
});

const renderList = (data: number[]) =>
  render(
    <FlashList
      data={data}
      drawDistance={0}
      overrideProps={{ initialDrawBatchSize: 1 }}
      renderItem={({ item }) => <Text>{String(item)}</Text>}
    />
  );

const renderedItems = (root: ReturnType<typeof renderList>) =>
  root.findAll(Text).map((node) => node.prop("children"));

beforeEach(() => {
  mockItemHeight = 100;
});

describe("layout reads for indices that no longer exist", () => {
  it("survives a data array that shrinks in place, past the render stack", () => {
    const data = Array.from({ length: 100 }, (_, index) => index);
    const root = renderList(data);

    // The items turn out far taller than the first pass assumed, so the engaged
    // range collapses while the render stack keeps every key it handed out.
    mockItemHeight = 900;
    root.setProps({ extraData: 1 });
    root.setProps({ extraData: 2 });
    root.setProps({ extraData: 3 });

    // Shrinking the same array in place is the case the component cannot see:
    // processDataUpdate() is memoized on the `data` reference, so only the
    // measurement effect notices, and it truncates the layout table without
    // re-syncing the render stack.
    data.length = 3;

    expect(() => root.setProps({ extraData: 4 })).not.toThrow();
    // Entries left pointing past the end render nothing rather than a cell with
    // an undefined item and no layout.
    expect(renderedItems(root)).toEqual(["0", "1", "2"]);

    root.unmount();
  });

  it("survives an onLayout that arrives after its index was dropped", () => {
    const root = renderList(Array.from({ length: 100 }, (_, index) => index));

    // Take the callback the way the platform holds it: captured while the cell
    // was mounted, with its index baked in.
    const cell = root
      .findAllWhere(
        (node) =>
          typeof (node.props as { index?: unknown }).index === "number" &&
          (node.props as { layout?: unknown }).layout !== undefined
      )
      .pop()!;
    const staleIndex = (cell.props as { index: number }).index;
    const staleOnLayout = cell
      .findAll(View)
      .map((node) => node.prop("onLayout"))
      .find(
        (handler): handler is (event: unknown) => void =>
          typeof handler === "function"
      )!;

    expect(staleIndex).toBeGreaterThan(2);

    // The list moves on to three items, so that index is gone from the layout
    // table, and only then does the queued measurement land.
    root.setProps({ data: [0, 1, 2] });

    expect(() =>
      staleOnLayout({
        nativeEvent: { layout: { x: 0, y: 0, width: 399, height: 123 } },
      })
    ).not.toThrow();

    root.unmount();
  });
});
