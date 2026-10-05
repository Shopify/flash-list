interface Layout {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Size {
  width: number;
  height: number;
}

/**
 * Gets scroll offsets from up to 3 parent elements
 */
function getScrollOffsets(element: Element, stopAt: Element) {
  let scrollX = 0;
  let scrollY = 0;
  let currentElement: Element | null = element;

  // Only check up to 3 parent elements
  while (currentElement && currentElement !== stopAt) {
    const htmlElement = currentElement as HTMLElement;
    scrollX += htmlElement.scrollLeft ?? 0;
    scrollY += htmlElement.scrollTop ?? 0;
    currentElement = currentElement.parentElement;
  }

  return { scrollX, scrollY };
}

/**
 * Checks if two dimension values are not equal, with a small tolerance.
 */
export function areDimensionsNotEqual(value1: number, value2: number): boolean {
  return !areDimensionsEqual(value1, value2);
}

/**
 * Checks if two dimension values are equal, with a small tolerance.
 */
export function areDimensionsEqual(value1: number, value2: number): boolean {
  return Math.abs(value1 - value2) <= 1;
}

export function roundOffPixel(value: number): number {
  return value;
}

/**
 * Measures the size of the RecyclerView's outer container.
 */
export function measureParentSize(view: Element): Size {
  return {
    width: view.clientWidth,
    height: view.clientHeight,
  };
}

/**
 * Checks whether the container is hidden (display: none / detached).
 * Every size reads as 0 then; measuring would overwrite real item layouts
 * with 0 and make the list engage every item.
 */
export function isViewHidden(view: Element | null): boolean {
  return !view || (view.clientWidth === 0 && view.clientHeight === 0);
}

/**
 * Measures the layout of child container of RecyclerView
 */
export function measureFirstChildLayout(
  childContainerView: Element,
  parentView: Element
): Layout {
  const childRect = childContainerView.getBoundingClientRect();
  const parentRect = parentView.getBoundingClientRect();

  // Get scroll offsets for child container (max 3 parents)
  const scrollOffsets = getScrollOffsets(childContainerView, parentView);

  return {
    x: childRect.left - parentRect.left + scrollOffsets.scrollX,
    y: childRect.top - parentRect.top + scrollOffsets.scrollY,
    width: roundOffPixel(childRect.width),
    height: roundOffPixel(childRect.height),
  };
}

/**
 * Measures the layout of items of RecyclerView
 */
export function measureItemLayout(
  item: Element,
  oldLayout: Layout | undefined
): Layout {
  const layout = {
    x: 0,
    y: 0,
    width: item.clientWidth,
    height: item.clientHeight,
  };

  if (oldLayout) {
    if (areDimensionsEqual(layout.width, oldLayout.width)) {
      layout.width = oldLayout.width;
    }
    if (areDimensionsEqual(layout.height, oldLayout.height)) {
      layout.height = oldLayout.height;
    }
  }

  return layout;
}
