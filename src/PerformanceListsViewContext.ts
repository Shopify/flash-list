import React from "react";

export const PerformanceListsViewContext = React.createContext<{
  onInteractive: (TTI: number, listName: string) => void;
}>({ onInteractive: () => {} });

export const PerformanceListsViewContextProvider =
  PerformanceListsViewContext.Provider;
