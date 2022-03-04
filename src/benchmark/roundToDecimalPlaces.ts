export function roundToDecimalPlaces(value: number, decimalPlaces: number) {
  const multiplier = 10 ** decimalPlaces;
  return Math.round(value * multiplier) / multiplier;
}
