/**
 * Increases the data size by duplicating it, it's kept in hook format so that in future we can add auto pagination support.
 * If you're using this with FlatList then make sure you remove `keyExtractor` because this method might duplicate ids that might be in the data.
 * @param data The data to duplicate
 * @param count Final count of data to be returned from this hook
 * @returns Multiplied data.
 */
export function useDataMultiplier<T>(data: T[], count: number): [T[]] {
  const len = data.length;
  const arr = new Array<T>(count);
  let isObject = false;
  if (typeof data[0] === "object") {
    isObject = true;
  }
  for (let i = 0; i < count; i++) {
    arr[i] = isObject ? { ...data[i % len] } : data[i % len];
  }
  return [arr];
}
