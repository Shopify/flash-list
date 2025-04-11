import { createContext, useContext } from "react";
import { CompatScroller } from "./components/CompatScroller";

export interface RecyclerViewContext {
  layout: () => void;
  getRef: () => React.Ref<any>;
  getScrollViewRef: () => React.RefObject<CompatScroller | null>;
  markChildLayoutAsPending: (id: string) => void;
  unmarkChildLayoutAsPending: (id: string) => void;
}

const RecyclerViewContextInstance = createContext<
  RecyclerViewContext | undefined
>(undefined);

export const RecyclerViewContextProvider = RecyclerViewContextInstance.Provider;
export function useRecyclerViewContext() {
  return useContext(RecyclerViewContextInstance);
}
