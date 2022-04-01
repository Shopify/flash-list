import React, { useState, createContext, useMemo } from "react";
import type { ReactNode } from "react";

const scrollToIndexDelayDefaultValue = 2000;

interface ScrollToIndexInterface {
  delay?: number;
  index?: number;
  setIndex: (index: number) => void;
}

export interface DebugContextInterface {
  emptyListEnabled: boolean;
  pagingEnabled: boolean;
  initialScrollIndex?: number;
  setEmptyListEnabled: (emptyList: boolean) => void;
  setPagingEnabled: (pagingEnabled: boolean) => void;
  setInitialScrollIndex: (initialScrollIndex: number) => void;
  scrollToIndex: ScrollToIndexInterface;
}

const DebugContextDefaultValue = {
  emptyListEnabled: false,
  pagingEnabled: false,
  setEmptyListEnabled: () => {},
  setInitialScrollIndex: () => {},
  setPagingEnabled: () => {},
  scrollToIndex: {
    setIndex: () => {},
  },
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
  >(undefined);
  const [pagingEnabled, setPagingEnabled] = useState(false);

  const [scrollToIndexWithDelay, setScrollToIndexWithDelay] = useState<
    number | undefined
  >(undefined);

  const scrollToIndexMomoized = useMemo(
    () => ({
      delay: scrollToIndexWithDelay
        ? scrollToIndexDelayDefaultValue
        : undefined,
      index: initialScrollIndex,
      setIndex: setScrollToIndexWithDelay,
    }),
    [scrollToIndexWithDelay, setScrollToIndexWithDelay]
  );

  const memoizedValue = useMemo(
    () => ({
      emptyListEnabled,
      setEmptyListEnabled,
      initialScrollIndex,
      setInitialScrollIndex,
      pagingEnabled,
      setPagingEnabled,
      scrollToIndex: scrollToIndexMomoized,
    }),
    [
      emptyListEnabled,
      setEmptyListEnabled,
      initialScrollIndex,
      setInitialScrollIndex,
      pagingEnabled,
      setPagingEnabled,
      scrollToIndexMomoized,
    ]
  );

  return (
    <DebugContext.Provider value={memoizedValue}>
      {children}
    </DebugContext.Provider>
  );
};

export default DebugContextProvider;
