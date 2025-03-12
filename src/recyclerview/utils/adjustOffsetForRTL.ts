export function adjustOffsetForRTL(
  offset: number,
  contentSize: number,
  windowSize: number
) {
  return contentSize - offset - windowSize;
}
