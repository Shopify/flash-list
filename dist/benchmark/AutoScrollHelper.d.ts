/**
 * This method can be used to trigger scroll events that can be forwarded to an element. Anything that implements scrollable can leverage this.
 * @param scroll The scrollable element
 * @param fromX The x offset to start from
 * @param fromY The y offset to start from
 * @param toX the x offset to end scroll at
 * @param toY the y offset to end scroll at
 * @param speedMultiplier  the speed multiplier to use
 * @param cancellable can be used to cancel the scroll
 * @returns Promise that resolves when the scroll is complete
 */
export declare function autoScroll(scroll: (x: number, y: number, animated: boolean) => void, fromX: number, fromY: number, toX: number, toY: number, speedMultiplier?: number, cancellable?: Cancellable): Promise<boolean>;
export declare class Cancellable {
    cancel(): void;
    isCancelled(): boolean;
    _isCancelled: boolean;
}
//# sourceMappingURL=AutoScrollHelper.d.ts.map