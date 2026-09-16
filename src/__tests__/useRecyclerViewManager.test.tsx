import React from "react";
import { render } from "@quilted/react-testing";

import { FlashListProps } from "../FlashListProps";
import { RecyclerViewManager } from "../recyclerview/RecyclerViewManager";
import { useRecyclerViewManager } from "../recyclerview/hooks/useRecyclerViewManager";

const TestComponent = <T,>({
  listProps,
  onRender,
}: {
  listProps: FlashListProps<T>;
  onRender: (manager: RecyclerViewManager<T>) => void;
}) => {
  const { recyclerViewManager } = useRecyclerViewManager(listProps);
  onRender(recyclerViewManager);
  return null;
};

describe("useRecyclerViewManager", () => {
  it("reassigns item types when extraData changes", () => {
    const data = [{ id: 1 }];
    let itemType = "standard";
    let manager: RecyclerViewManager<typeof data[number]> | undefined;
    const listProps: FlashListProps<typeof data[number]> = {
      data,
      extraData: { version: 1 },
      getItemType: () => itemType,
      renderItem: jest.fn(),
    };
    const component = render(
      <TestComponent
        listProps={listProps}
        onRender={(currentManager) => {
          manager = currentManager;
        }}
      />
    );

    manager?.updateLayoutParams({ width: 100, height: 100 }, 0);
    manager?.processDataUpdate();
    expect(Array.from(manager?.getRenderStack().values() ?? [])).toEqual([
      expect.objectContaining({ itemType: "standard" }),
    ]);

    itemType = "featured";
    component.setProps({
      listProps: {
        ...listProps,
        extraData: { version: 2 },
      },
    });

    expect(Array.from(manager?.getRenderStack().values() ?? [])).toEqual([
      expect.objectContaining({ itemType: "featured" }),
    ]);
  });
});
