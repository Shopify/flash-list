import React, { useState, createContext, useMemo } from "react";
import type { ReactNode } from "react";

export interface DebugContextInterface {
  emptyListEnabled: boolean;
  pagingEnabled: boolean;
  initialScrollIndex?: number;
  setEmptyListEnabled: (emptyList: boolean) => void;
  setPagingEnabled: (pagingEnabled: boolean) => void;
  setInitialScrollIndex: (initialScrollIndex: number) => void;
}

const DebugContextDefaultValue = {
  emptyListEnabled: false,
  pagingEnabled: false,
  setEmptyListEnabled: () => {},
  setInitialScrollIndex: () => {},
  setPagingEnabled: () => {},
};

export const DebugContext = createContext<DebugContextInterface>(
  DebugContextDefaultValue
);

interface DebugContextProviderProps {
  children: ReactNode;
}

const DebugContextProvider = ({ children }: DebugContextProviderProps) => {
  const [emptyListEnabled, setEmptyListEnabled] = useState(false);
  const [initialScrollIndex, setInitialScrollIndex] = useState<
    number | undefined
  >();
  const [pagingEnabled, setPagingEnabled] = useState(false);

  const memoizedValue = useMemo(
    () => ({
      emptyListEnabled,
      setEmptyListEnabled,
      initialScrollIndex,
      setInitialScrollIndex,
      pagingEnabled,
      setPagingEnabled,
    }),
    [
      emptyListEnabled,
      setEmptyListEnabled,
      initialScrollIndex,
      setInitialScrollIndex,
      pagingEnabled,
      setPagingEnabled,
    ]
  );

  return (
    <DebugContext.Provider value={memoizedValue}>
      {children}
    </DebugContext.Provider>
  );
};

export default DebugContextProvider;
