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
      value: context.emptyList,
      onToggle: (value: boolean) => {
        context.setEmptyList(value);
      },
    },
    {
      name: "initialScrollIndex enabled",
      value: context.initialScrollIndexEnabled,
      onToggle: (value: boolean) => {
        context.setInitialScrollIndexEnabled(value);
      },
    },
  ];

  return items;
};
