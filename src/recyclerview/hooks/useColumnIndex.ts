import { createContext, useContext } from "react";

const ColumnIndexContext = createContext(0);

/** Lets a column change re-render only `useColumnIndex` callers. */
export const ColumnIndexProvider = ColumnIndexContext.Provider;

/**
 * Returns the zero-based column the enclosing item is placed in when `numColumns > 1` (grid or masonry).
 * For items spanning multiple columns (via `overrideItemLayout`), this is the start column.
 * Returns `0` for single-column lists and outside of FlashList items.
 * In RTL layouts, column `0` is the rightmost (start) column.
 *
 * In masonry layouts, items are placed based on measured heights, so the column can change
 * after the first render or when item sizes change. Avoid making an item's height depend on it.
 */
export function useColumnIndex(): number {
  return useContext(ColumnIndexContext);
}
