import React, { Suspense, useDeferredValue, useMemo } from "react";
import { Text } from "react-native";
import { act, create, ReactTestRenderer } from "react-test-renderer";

import { FlashList } from "..";

jest.mock("../recyclerview/utils/measureLayout", () => {
  const originalModule = jest.requireActual(
    "../recyclerview/utils/measureLayout"
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
      width: 400,
      height: 100,
    })),
  };
});

const ROWS = ["Row 0", "Row 1", "Row 2", "Row 3", "Row 4", "Row 5"];
const NEVER_RESOLVES = new Promise<never>(() => {});

const SuspendAt = ({ rowCount, at }: { rowCount: number; at: number }) => {
  if (rowCount === at) {
    throw NEVER_RESOLVES;
  }
  return null;
};

interface DeferredListProps {
  rowCount: number;
  tick: number;
  suspendAt: number;
}

const DeferredList = ({ rowCount, tick, suspendAt }: DeferredListProps) => {
  const deferredRowCount = useDeferredValue(rowCount);
  const data = useMemo(
    () => ROWS.slice(0, deferredRowCount),
    [deferredRowCount]
  );
  return (
    <Suspense fallback={null}>
      <FlashList
        data={data}
        extraData={tick}
        keyExtractor={(row) => row}
        renderItem={({ item }) => <Text>{item}</Text>}
      />
      <SuspendAt rowCount={deferredRowCount} at={suspendAt} />
    </Suspense>
  );
};

const renderedRows = (renderer: ReactTestRenderer) =>
  renderer.root
    .findAllByType(Text)
    .map((node) => node.props.children as string | undefined)
    .sort();

describe("useRecyclerViewManager", () => {
  beforeAll(() => {
    (global as any).IS_REACT_ACT_ENVIRONMENT = true;
  });

  it("renders only committed data after React discards a render with more items", async () => {
    let renderer!: ReactTestRenderer;
    await act(async () => {
      renderer = create(<DeferredList rowCount={2} tick={0} suspendAt={6} />, {
        /* eslint-disable-next-line @typescript-eslint/naming-convention */
        unstable_isConcurrent: true,
      });
    });
    expect(renderedRows(renderer)).toEqual(["Row 0", "Row 1"]);

    // The deferred render with six rows suspends and is thrown away.
    await act(async () => {
      renderer.update(<DeferredList rowCount={6} tick={0} suspendAt={6} />);
    });
    await act(async () => {
      renderer.update(<DeferredList rowCount={6} tick={1} suspendAt={6} />);
    });

    expect(renderedRows(renderer)).toEqual(["Row 0", "Row 1"]);
  });
});
