import { createContext, useContext } from "react";

export interface RecyclerViewContext {
  layout: () => void;
}

const RecyclerViewContextInstance = createContext<
  RecyclerViewContext | undefined
>(undefined);

export const RecyclerViewContextProvider = RecyclerViewContextInstance.Provider;
export function useRecyclerViewContext() {
  return useContext(RecyclerViewContextInstance);
}
