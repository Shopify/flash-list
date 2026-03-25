import { useMemo } from "react";

/**
 * Derives sticky header indices from either an `isStickyItem` predicate or
 * an explicit `stickyHeaderIndices` array. When `isStickyItem` is provided,
 * it takes precedence and the indices are recomputed whenever `data` changes.
 */
export function useStickyHeaderIndices<TItem>(
  isStickyItem: ((item: TItem, index: number) => boolean) | undefined,
  data: ReadonlyArray<TItem> | null | undefined,
  stickyHeaderIndicesProp: number[] | undefined
): number[] | undefined {
  return useMemo(() => {
    if (isStickyItem && data) {
      const indices: number[] = [];
      for (let i = 0; i < data.length; i++) {
        if (isStickyItem(data[i], i)) {
          indices.push(i);
        }
      }
      return indices;
    }
    return stickyHeaderIndicesProp;
  }, [isStickyItem, data, stickyHeaderIndicesProp]);
}
