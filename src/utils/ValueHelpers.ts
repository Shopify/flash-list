export function isNullOrUndefined(value: any): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * The goal of this method is to simplify getting a default value for properties if they are null or undefined.
 * This method also ensures that it doesn't fail for empty strings or false boolean values. empty strings and false booleans will be returned as is.
 * @param value Value that needs to be checked
 * @param defaultValue Return value if value is null or undefined
 * @returns value or defaultValue based on whether value is null or undefined
 */
export function valueOrDefault<T>(
  value: T | null | undefined,
  defaultValue: T
): T {
  return isNullOrUndefined(value) ? defaultValue : value;
}
