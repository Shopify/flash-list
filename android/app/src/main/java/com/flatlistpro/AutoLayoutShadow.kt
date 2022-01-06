package com.flatlistpro

class AutoLayoutShadow {
    var horizontal: Boolean = false
    var scrollOffset: Int = 0
    var windowSize: Int = 0
    var renderOffset = 0

    /** Checks for overlaps or gaps between adjacent items and then applies a correction.
     * Performance: RecyclerListView renders very small number of views and this is not going to trigger multiple layouts on Android side. Not expecting any major perf issue. */
    fun clearGapsAndOverlaps(sortedItems: Array<CellContainer>) {
        var currentMax = 0

        for (i in 0 until sortedItems.size - 1) {
            val cell = sortedItems[i]
            val neighbour = sortedItems[i + 1]
            if (isWithinBounds(cell)) {
                if (!horizontal) {
                    currentMax = kotlin.math.max(currentMax, cell.bottom);
                    if (cell.left < neighbour.left) {
                        if (cell.right != neighbour.left) {
                            neighbour.right = cell.right + neighbour.width
                            neighbour.left = cell.right
                        }
                        if (cell.top != neighbour.top) {
                            neighbour.bottom = cell.top + neighbour.height
                            neighbour.top = cell.top
                        }
                    } else {
                        neighbour.bottom = currentMax + neighbour.height
                        neighbour.top = currentMax

                    }
                } else {
                    currentMax = kotlin.math.max(currentMax, cell.right);
                    if (cell.top < neighbour.top) {
                        if (cell.bottom != neighbour.top) {
                            neighbour.bottom = cell.bottom + neighbour.height
                            neighbour.top = cell.bottom
                        }
                        if (cell.left != neighbour.left) {
                            neighbour.right = cell.left + neighbour.width
                            neighbour.left = cell.left
                        }
                    } else {
                        neighbour.right = currentMax + neighbour.width
                        neighbour.left = currentMax
                    }
                }
            }
        }
    }

    /** It's important to avoid correcting views outside the render window. An item that isn't being recycled might still remain in the view tree. If views outside get considered then gaps between
     * unused items will cause algorithm to fail.*/
    private fun isWithinBounds(cell: CellContainer): Boolean {
        return if (!horizontal) {
            (cell.top >= (scrollOffset - renderOffset) || cell.bottom >= (scrollOffset - renderOffset)) &&
                    (cell.top <= scrollOffset + windowSize || cell.bottom <= scrollOffset + windowSize)
        } else {
            (cell.left >= (scrollOffset - renderOffset) || cell.right >= (scrollOffset - renderOffset)) &&
                    (cell.left <= scrollOffset + windowSize || cell.right <= scrollOffset + windowSize)
        }
    }
}