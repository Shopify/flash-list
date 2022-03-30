import React, { useState, createContext, useMemo } from "react";
import type { ReactNode } from "react";

export interface DebugContextInterface {
  emptyList: boolean;
  initialScrollIndexEnabled: boolean;
  setEmptyList: (emptyList: boolean) => void;
  setInitialScrollIndexEnabled: (initialScrollIndexEnabled: boolean) => void;
}

export const DebugContext = createContext<DebugContextInterface | null>(null);

interface DebugContextProviderProps {
  children: ReactNode;
}

const DebugContextProvider = ({ children }: DebugContextProviderProps) => {
  const [emptyList, setEmptyList] = useState(false);
  const [initialScrollIndexEnabled, setInitialScrollIndexEnabled] =
    useState(false);

  const memoizedValue = useMemo(
    () => ({
      emptyList,
      setEmptyList,
      initialScrollIndexEnabled,
      setInitialScrollIndexEnabled,
    }),
    [
      emptyList,
      setEmptyList,
      initialScrollIndexEnabled,
      setInitialScrollIndexEnabled,
    ]
  );

  return (
    <DebugContext.Provider value={memoizedValue}>
      {children}
    </DebugContext.Provider>
  );
};

export default DebugContextProvider;
