import { RVLayout } from "../LayoutManager";

/**
 * A helper function to perform binary search for the first or last visible index.
 *
 * @param layouts - The sorted array of RVLayout objects.
 * @param threshold - The threshold value to determine visibility.
 * @param isSortedByX - A boolean indicating if the array is sorted by x (true) or y (false).
 * @param findFirst - A boolean indicating whether to find the first (true) or last (false) visible index.
 * @returns The index of the visible layout or -1 if none are visible.
 */
function binarySearchVisibleIndex(
  layouts: RVLayout[],
  threshold: number,
  isSortedByX: boolean,
  findFirst: boolean
): number {
  let left = 0;
  let right = layouts.length - 1;
  let visibleIndex = -1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const layout = layouts[mid];

    // Check visibility based on the sorting criteria
    const position = isSortedByX ? layout.x : layout.y;
    const size = isSortedByX ? layout.width : layout.height;

    if (findFirst) {
      // Logic for finding the first visible index
      if (position >= threshold || position + size >= threshold) {
        // Potential visible index
        visibleIndex = mid;
        // Search in the left half for the first visible
        right = mid - 1;
      } else {
        // Search in the right half
        left = mid + 1;
      }
    } else if (position <= threshold) {
      // Potential visible index
      visibleIndex = mid;
      // Search in the right half for the last visible
      left = mid + 1;
    } else {
      // Search in the left half
      right = mid - 1;
    }
  }

  return visibleIndex;
}

/**
 * Finds the first visible index in a sorted array of RVLayout objects.
 *
 * @param layouts - The sorted array of RVLayout objects.
 * @param threshold - The threshold value to determine visibility.
 * @param isSortedByX - A boolean indicating if the array is sorted by x (true) or y (false).
 * @returns The index of the first visible layout or -1 if none are visible.
 */
export function findFirstVisibleIndex(
  layouts: RVLayout[],
  threshold: number,
  isSortedByX: boolean
): number {
  return binarySearchVisibleIndex(layouts, threshold, isSortedByX, true);
}

/**
 * Finds the last visible index in a sorted array of RVLayout objects.
 *
 * @param layouts - The sorted array of RVLayout objects.
 * @param threshold - The threshold value to determine visibility.
 * @param isSortedByX - A boolean indicating if the array is sorted by x (true) or y (false).
 * @returns The index of the last visible layout or -1 if none are visible.
 */
export function findLastVisibleIndex(
  layouts: RVLayout[],
  threshold: number,
  isSortedByX: boolean
): number {
  return binarySearchVisibleIndex(layouts, threshold, isSortedByX, false);
}
