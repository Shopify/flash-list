/**
 * Helper class to calculate running average of the most recent n values
 */
export class AverageWindow {
  private currentAverage: number;
  private currentCount: number;
  private inputValues: (number | undefined)[];
  private nextIndex = 0;
  constructor(size: number, startValue?: number) {
    this.inputValues = new Array<number>(Math.max(1, size));
    this.currentAverage = startValue ?? 0;
    this.currentCount = startValue === undefined ? 0 : 1;
    this.nextIndex = this.currentCount;
    this.inputValues[0] = startValue;
  }

  /**
   * Can be used to get the current average value
   */
  public get currentValue(): number {
    return this.currentAverage;
  }

  /**
   *
   * @param value Add new value to the average window and updated current average
   */
  public addValue(value: number): void {
    const target = this.getNextIndex();
    const oldValue = this.inputValues[target];
    const newCount =
      oldValue === undefined ? this.currentCount + 1 : this.currentCount;

    this.inputValues[target] = value;

    this.currentAverage =
      this.currentAverage * (this.currentCount / newCount) +
      (value - (oldValue ?? 0)) / newCount;

    this.currentCount = newCount;
  }

  private getNextIndex(): number {
    // starts from 0 once we reach end of the array
    const newTarget = this.nextIndex;
    this.nextIndex = (this.nextIndex + 1) % this.inputValues.length;
    return newTarget;
  }
}

export class MultiTypeAverageWindow {
  private averageWindows: Map<string | number, AverageWindow>;
  private windowSize: number;
  private defaultValue?: number;
  /**
   * @param windowSize Size of the average window
   * @param defaultValue Default value to return if no value is available
   */
  constructor(windowSize: number, defaultValue?: number) {
    this.averageWindows = new Map<string | number, AverageWindow>();
    this.windowSize = windowSize;
    this.defaultValue = defaultValue;
  }

  public addValue(value: number, type: string | number): void {
    let averageWindow = this.averageWindows.get(type);
    if (!averageWindow) {
      averageWindow = new AverageWindow(this.windowSize);
      this.averageWindows.set(type, averageWindow);
    }
    averageWindow.addValue(value);
  }

  public getCurrentValue(type: string | number): number {
    const averageWindow = this.averageWindows.get(type);
    return averageWindow?.currentValue ?? this.defaultValue ?? 0;
  }

  public reset(): void {
    this.averageWindows.clear();
  }
}
