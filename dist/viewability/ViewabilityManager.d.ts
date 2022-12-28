import FlashList from "../FlashList";
/**
 * Manager for viewability tracking. It holds multiple viewability callback pairs and keeps them updated.
 */
export default class ViewabilityManager<T> {
    private flashListRef;
    private viewabilityHelpers;
    private hasInteracted;
    constructor(flashListRef: FlashList<T>);
    /**
     * @returns true if the viewability manager has any viewability callback pairs registered.
     */
    get shouldListenToVisibleIndices(): boolean;
    dispose: () => void;
    onVisibleIndicesChanged: (all: number[]) => void;
    recordInteraction: () => void;
    updateViewableItems: (newViewableIndices?: number[]) => void;
    /**
     * Creates a new `ViewabilityHelper` instance with `onViewableItemsChanged` callback and `ViewabilityConfig`
     * @returns `ViewabilityHelper` instance
     */
    private createViewabilityHelper;
}
//# sourceMappingURL=ViewabilityManager.d.ts.map