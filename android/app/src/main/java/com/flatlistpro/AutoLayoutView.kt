package com.flatlistpro

import android.content.Context
import android.graphics.Canvas
import android.graphics.drawable.Drawable
import android.os.Build
import android.util.Log
import android.view.View
import android.view.View.MeasureSpec
import android.view.ViewGroup
import android.widget.TextView
import androidx.annotation.RequiresApi
import com.facebook.react.views.scroll.ReactScrollView
import com.facebook.react.views.view.ReactViewGroup

/** Container for all RecyclerListView children. This will automatically remove all gaps and overlaps for GridLayouts with flexible spans.
 * Note: This cannot work for masonry layouts i.e, pinterest like layout */
class AutoLayoutView(context: Context) : ReactViewGroup(context) {
    var horizontal: Boolean = false
    var scrollOffset: Int = 0
    var windowSize: Int = 0
    var renderOffset = 0

    /** Overriding draw instead of onLayout. RecyclerListView uses absolute positions for each and every item which means that changes in child layouts may not trigger onLayout on this container. The same layout
     * can still cause views to overlap. Therefore, it makes sense to override draw to do correction. */
    override fun dispatchDraw(canvas: Canvas?) {
        fixLayout()
        super.dispatchDraw(canvas)
    }

    /** Sorts views by index and then invokes clearGaps which does the correction.
     * Performance: Sort is needed. Given relatively low number of views in RecyclerListView render tree this should be a non issue.*/
    private fun fixLayout() {
        if (childCount > 1) {
            val positionSortedViews = Array(childCount) { getChildAt(it) as CellContainer }
            positionSortedViews.sortBy { it.index }
            clearGaps(positionSortedViews)
        }
    }

    /** Checks for overlaps or gaps between adjacent items and then applies a correction.
     * Performance: RecyclerListView renders very small number of views and this is not going to trigger multiple layouts on Android side. Not expecting any major perf issue. */
    private fun clearGaps(sortedItems: Array<CellContainer>) {
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
    private fun isWithinBounds(cell: View): Boolean {
        return if (!horizontal) {
            (cell.top >= (scrollOffset - renderOffset) || cell.bottom >= (scrollOffset - renderOffset)) &&
                    (cell.top <= scrollOffset + windowSize || cell.bottom <= scrollOffset + windowSize)
        } else {
            (cell.left >= (scrollOffset - renderOffset) || cell.right >= (scrollOffset - renderOffset)) &&
                    (cell.left <= scrollOffset + windowSize || cell.right <= scrollOffset + windowSize)
        }
    }
}
