import { DebugContextInterface } from "./DebugContext";

export interface DebugItem {
  name: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  testID: DebugOption;
}

export enum DebugOption {
  EmptyList = "empty-list",
  InitialScrollIndex = "initial-scroll-index",
}

export const getDebugItems = (context: DebugContextInterface): DebugItem[] => {
  const items: DebugItem[] = [
    {
      name: "Show empty list",
      value: context.emptyListEnabled,
      onToggle: (value: boolean) => {
        context.setEmptyListEnabled(value);
      },
      testID: DebugOption.EmptyList,
    },
    {
      name: "initialScrollIndex enabled",
      value: context.initialScrollIndexEnabled,
      onToggle: (value: boolean) => {
        context.setInitialScrollIndexEnabled(value);
      },
      testID: DebugOption.InitialScrollIndex,
    },
  ];

  return items;
};
