import React from "react";
import { Text } from "react-native";
import "@quilted/react-testing/matchers";
import { render } from "@quilted/react-testing";

import { useStickyHeaderIndices } from "../recyclerview/hooks/useStickyHeaderIndices";

/**
 * Test wrapper that renders the hook result as text for assertion.
 */
function TestComponent<T>({
  isStickyItem,
  data,
  stickyHeaderIndicesProp,
}: {
  isStickyItem?: (item: T, index: number) => boolean;
  data: ReadonlyArray<T> | null | undefined;
  stickyHeaderIndicesProp?: number[];
}) {
  const result = useStickyHeaderIndices(
    isStickyItem,
    data,
    stickyHeaderIndicesProp
  );
  return <Text>{JSON.stringify(result ?? null)}</Text>;
}

function expectResult(rendered: ReturnType<typeof render>, expected: string) {
  expect(rendered).toContainReactComponent(Text, { children: expected });
}

describe("useStickyHeaderIndices", () => {
  it("should derive indices from isStickyItem predicate", () => {
    const data = ["header", "item", "item", "header", "item"];
    const result = render(
      <TestComponent
        isStickyItem={(item: string) => item === "header"}
        data={data}
      />
    );
    expectResult(result, JSON.stringify([0, 3]));
  });

  it("should return stickyHeaderIndicesProp when isStickyItem is not provided", () => {
    const data = ["a", "b", "c"];
    const result = render(
      <TestComponent
        data={data}
        stickyHeaderIndicesProp={[0, 2]}
      />
    );
    expectResult(result, JSON.stringify([0, 2]));
  });

  it("should return undefined when neither prop is provided", () => {
    const result = render(<TestComponent data={["a", "b"]} />);
    expectResult(result, "null");
  });

  it("should prefer isStickyItem over stickyHeaderIndicesProp", () => {
    const data = ["header", "item", "header"];
    const result = render(
      <TestComponent
        isStickyItem={(item: string) => item === "header"}
        data={data}
        stickyHeaderIndicesProp={[1]}
      />
    );
    expectResult(result, JSON.stringify([0, 2]));
  });

  it("should return empty array when isStickyItem returns false for all items", () => {
    const data = ["a", "b", "c"];
    const result = render(
      <TestComponent isStickyItem={() => false} data={data} />
    );
    expectResult(result, JSON.stringify([]));
  });

  it("should return empty array when data is empty and isStickyItem is provided", () => {
    const result = render(
      <TestComponent isStickyItem={() => true} data={[]} />
    );
    expectResult(result, JSON.stringify([]));
  });

  it("should return stickyHeaderIndicesProp when data is null", () => {
    const result = render(
      <TestComponent
        isStickyItem={() => true}
        data={null}
        stickyHeaderIndicesProp={[0]}
      />
    );
    expectResult(result, JSON.stringify([0]));
  });

  it("should pass index as second argument to predicate", () => {
    const data = ["a", "b", "c", "d", "e"];
    const result = render(
      <TestComponent
        isStickyItem={(_: string, index: number) => index % 2 === 0}
        data={data}
      />
    );
    expectResult(result, JSON.stringify([0, 2, 4]));
  });
});
