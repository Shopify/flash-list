import { createContext, useContext } from "react";

import { FlashListRef } from "../FlashListRef";

import { CompatScroller } from "./components/CompatScroller";

export interface RecyclerViewContext<T> {
  layout: () => void;
  getRef: () => FlashListRef<T> | null;
  getScrollViewRef: () => CompatScroller | null;
  markChildLayoutAsPending: (id: string) => void;
  unmarkChildLayoutAsPending: (id: string) => void;
}

const RecyclerViewContextInstance = createContext<
  RecyclerViewContext<unknown> | undefined
>(undefined);

export const RecyclerViewContextProvider = RecyclerViewContextInstance.Provider;
export function useRecyclerViewContext<T>():
  | RecyclerViewContext<T>
  | undefined {
  return useContext(RecyclerViewContextInstance) as
    | RecyclerViewContext<T>
    | undefined;
}
