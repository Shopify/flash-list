import React, { useState, createContext, useMemo } from "react";
import type { ReactNode } from "react";

const initialScrollIndexDefaultValue = 10;

export interface DebugContextInterface {
  emptyListEnabled: boolean;
  initialScrollIndexEnabled: boolean;
  initialScrollIndex: number;
  setEmptyListEnabled: (emptyList: boolean) => void;
  setInitialScrollIndexEnabled: (initialScrollIndexEnabled: boolean) => void;
}

const DebugContextDefaultValue = {
  emptyListEnabled: false,
  initialScrollIndexEnabled: false,
  initialScrollIndex: initialScrollIndexDefaultValue,
  setEmptyListEnabled: () => {},
  setInitialScrollIndexEnabled: () => {},
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

  const memoizedValue = useMemo(
    () => ({
      emptyListEnabled,
      setEmptyListEnabled,
      initialScrollIndexEnabled,
      setInitialScrollIndexEnabled,
      initialScrollIndex: initialScrollIndexDefaultValue,
    }),
    [
      emptyListEnabled,
      setEmptyListEnabled,
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
