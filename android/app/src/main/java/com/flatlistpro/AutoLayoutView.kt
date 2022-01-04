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

class AutoLayoutView(context: Context) : ReactViewGroup(context) {
    var horizontal: Boolean = false
    var scrollOffset: Int = 0
    var windowSize: Int = 0
    var renderOffset = 0


    override fun dispatchDraw(canvas: Canvas?) {
        fixLayout()
        super.dispatchDraw(canvas)
    }

    private fun fixLayout() {
        if (childCount > 1) {
            val positionSortedViews = Array(childCount) { getChildAt(it) as CellContainer }
            positionSortedViews.sortBy { it.index }
            clearGaps(positionSortedViews)
        }
    }

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
