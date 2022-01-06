package com.flatlistpro

import android.content.Context
import android.graphics.Canvas
import com.facebook.react.views.view.ReactViewGroup

/** Container for all RecyclerListView children. This will automatically remove all gaps and overlaps for GridLayouts with flexible spans.
 * Note: This cannot work for masonry layouts i.e, pinterest like layout */
class AutoLayoutView(context: Context) : ReactViewGroup(context) {
    val alShadow = AutoLayoutShadow()

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
            alShadow.clearGapsAndOverlaps(positionSortedViews)
        }
    }
}
