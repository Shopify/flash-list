/* eslint-disable @shopify/typescript/prefer-pascal-case-enums */
import {
  LayoutParams,
  RVDimension,
  RVLayout,
  RVLayoutInfo,
  RVLayoutManager,
} from "../../recyclerview/layout-managers/LayoutManager";
import { RVLinearLayoutManagerImpl } from "../../recyclerview/layout-managers/LinearLayoutManager";
import { RVGridLayoutManagerImpl } from "../../recyclerview/layout-managers/GridLayoutManager";
import { RVMasonryLayoutManagerImpl } from "../../recyclerview/layout-managers/MasonryLayoutManager";

/**
 * Layout manager types available in the app
 */
export enum LayoutManagerType {
  LINEAR = "linear",
  GRID = "grid",
  MASONRY = "masonry",
}

/**
 * Default window size for layout managers
 */
const DEFAULT_WINDOW_SIZE: RVDimension = {
  width: 400,
  height: 900,
};

/**
 * Create layout parameters with sensible defaults
 */
export function createLayoutParams(
  params: Partial<LayoutParams> = {}
): LayoutParams {
  return {
    windowSize: params.windowSize || DEFAULT_WINDOW_SIZE,
    horizontal: params.horizontal ?? false,
    maxColumns: params.maxColumns ?? 1,
    optimizeItemArrangement: params.optimizeItemArrangement ?? true,
    overrideItemLayout: params.overrideItemLayout ?? (() => {}),
    getItemType: params.getItemType ?? (() => "default"),
  };
}

/**
 * Create a layout manager of the specified type
 */
export function createLayoutManager(
  type: LayoutManagerType,
  params: Partial<LayoutParams> = {},
  previousLayoutManager?: RVLayoutManager
): RVLayoutManager {
  const layoutParams = createLayoutParams(params);

  switch (type) {
    case LayoutManagerType.LINEAR:
      return new RVLinearLayoutManagerImpl(layoutParams, previousLayoutManager);
    case LayoutManagerType.GRID:
      return new RVGridLayoutManagerImpl(layoutParams, previousLayoutManager);
    case LayoutManagerType.MASONRY:
      return new RVMasonryLayoutManagerImpl(
        layoutParams,
        previousLayoutManager
      );
    default:
      throw new Error(`Unknown layout manager type: ${type}`);
  }
}

/**
 * Generate mock layout info for testing
 */
export function createMockLayoutInfo(
  index: number,
  width: number,
  height: number
): RVLayoutInfo {
  return {
    index,
    dimensions: {
      width,
      height,
    },
  };
}

/**
 * Populate layout data in a layout manager
 */
export function populateLayouts(
  layoutManager: RVLayoutManager,
  itemCount: number,
  itemWidth = 100,
  itemHeight = 100,
  variableSize = false
): void {
  const layoutInfos: RVLayoutInfo[] = [];

  for (let i = 0; i < itemCount; i++) {
    // If variableSize is true, add some randomness to the item dimensions
    const width = variableSize ? itemWidth + (i % 3) * 20 : itemWidth;
    const height = variableSize ? itemHeight + (i % 5) * 25 : itemHeight;

    layoutInfos.push(createMockLayoutInfo(i, width, height));
  }

  layoutManager.modifyLayout(layoutInfos, itemCount);
}

/**
 * Create and populate a layout manager in one step
 */
export function createPopulatedLayoutManager(
  type: LayoutManagerType,
  itemCount: number,
  params: Partial<LayoutParams> = {},
  itemWidth = 100,
  itemHeight = 100,
  variableSize = false
): RVLayoutManager {
  const layoutManager = createLayoutManager(type, params);
  populateLayouts(
    layoutManager,
    itemCount,
    itemWidth,
    itemHeight,
    variableSize
  );
  return layoutManager;
}

/**
 * Get all layouts from a layout manager
 */
export function getAllLayouts(layoutManager: RVLayoutManager): RVLayout[] {
  // Access the internal layouts array
  return Array.from({ length: layoutManager.getLayoutCount() }, (_, index) =>
    layoutManager.getLayout(index)
  );
}
