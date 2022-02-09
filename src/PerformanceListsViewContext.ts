import React from "react";

interface PerformanceController {
  onInteractive: (TTI: number, listName: string) => void;
  onBlankAreaEvent: (
    offsetStart: number,
    offsetEnd: number,
    listName: string
  ) => void;
}

export const PerformanceListsViewContext =
  React.createContext<PerformanceController>({
    onInteractive: () => {},
    onBlankAreaEvent: () => {},
  });

export const PerformanceListsViewContextProvider =
  PerformanceListsViewContext.Provider;
