import React, { useState, createContext, useMemo } from "react";
import type { ReactNode } from "react";

const initialScrollIndexDefaultValue = 10;

export interface DebugContextInterface {
  emptyListEnabled: boolean;
  initialScrollIndexEnabled: boolean;
  initialScrollIndex?: number | null;
  pagingEnabled: boolean;
  setEmptyListEnabled: (emptyList: boolean) => void;
  setInitialScrollIndexEnabled: (initialScrollIndexEnabled: boolean) => void;
  setPagingEnabled: (pagingEnabled: boolean) => void;
}

const DebugContextDefaultValue = {
  emptyListEnabled: false,
  initialScrollIndexEnabled: false,
  pagingEnabled: false,
  setEmptyListEnabled: () => {},
  setInitialScrollIndexEnabled: () => {},
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
  const [initialScrollIndexEnabled, setInitialScrollIndexEnabled] =
    useState(false);
  const [pagingEnabled, setPagingEnabled] = useState(false);

  const memoizedValue = useMemo(
    () => ({
      emptyListEnabled,
      setEmptyListEnabled,
      initialScrollIndexEnabled,
      setInitialScrollIndexEnabled,
      initialScrollIndex: initialScrollIndexEnabled
        ? initialScrollIndexDefaultValue
        : null,
      pagingEnabled,
      setPagingEnabled,
    }),
    [
      emptyListEnabled,
      setEmptyListEnabled,
      initialScrollIndexEnabled,
      setInitialScrollIndexEnabled,
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
