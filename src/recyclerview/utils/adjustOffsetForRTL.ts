/**
 * Adjusts the scroll offset for Right-to-Left (RTL) layouts.
 * offset it flipped when RTL is enabled.
 * This function converts a left-to-right offset to its RTL equivalent.
 *
 * @param offset - The original scroll offset in LTR layout
 * @param contentSize - The total size of the scrollable content
 * @param windowSize - The size of the visible window/viewport
 * @returns The adjusted offset for RTL layout
 */
export function adjustOffsetForRTL(
  offset: number,
  contentSize: number,
  windowSize: number
) {
  return contentSize - offset - windowSize;
}
