import { DebugContextInterface } from "./DebugContext";

export enum DebugOptionType {
  Switch,
  Input,
}

export type DebugItem = DebugSwitchItem | DebugInputItem;

interface DebugSwitchItem {
  type: DebugOptionType.Switch;
  name: string;
  value?: boolean;
  onValue: (value: boolean) => void;
  testID: DebugOption;
}

interface DebugInputItem {
  type: DebugOptionType.Input;
  name: string;
  value?: number;
  onValue: (value: number) => void;
  testID: DebugOption;
}

export enum DebugOption {
  EmptyList = "empty-list",
  InitialScrollIndex = "initial-scroll-index",
  PagingEnabled = "paging-enabled",
}

export const getDebugItems = (context: DebugContextInterface): DebugItem[] => {
  const items: DebugItem[] = [
    {
      name: "Show empty list",
      type: DebugOptionType.Switch,
      value: context.emptyListEnabled,
      onValue: (value: boolean) => {
        context.setEmptyListEnabled(value);
      },
      testID: DebugOption.EmptyList,
    },
    {
      name: "initialScrollIndex",
      type: DebugOptionType.Input,
      value: context.initialScrollIndex,
      onValue: (value: number) => {
        context.setInitialScrollIndex(value);
      },
      testID: DebugOption.InitialScrollIndex,
    },
    {
      name: "Paging enabled",
      type: DebugOptionType.Switch,
      value: context.pagingEnabled,
      onValue: (value: boolean) => {
        context.setPagingEnabled(value);
      },
      testID: DebugOption.PagingEnabled,
    },
  ];

  return items;
};
