import { DebugContextInterface } from "./DebugContext";

export interface DebugOption {
  name: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}

export const getDebugOptions = (
  context: DebugContextInterface
): DebugOption[] => {
  const items: DebugOption[] = [
    {
      name: "Show empty list",
      value: context.emptyListEnabled,
      onToggle: (value: boolean) => {
        context.setEmptyListEnabled(value);
      },
    },
    {
      name: "initialScrollIndex enabled",
      value: context.initialScrollIndexEnabled,
      onToggle: (value: boolean) => {
        context.setInitialScrollIndexEnabled(value);
      },
    },
    {
      name: "Paging enabled",
      value: context.pagingEnabled,
      onToggle: (value: boolean) => {
        context.setPagingEnabled(value);
      },
    },
  ];

  return items;
};
