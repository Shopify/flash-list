/**
 * Helper class to calculate running average of the most recent n values
 */
export declare class AverageWindow {
    private currentAverage;
    private currentCount;
    private inputValues;
    private nextIndex;
    constructor(size: number, startValue?: number);
    /**
     * Can be used to get the current average value
     */
    get currentValue(): number;
    /**
     *
     * @param value Add new value to the average window and updated current average
     */
    addValue(value: number): void;
    private getNextIndex;
}
//# sourceMappingURL=AverageWindow.d.ts.map