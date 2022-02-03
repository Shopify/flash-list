package com.shopify.reactnative.recycler_flat_list

import android.content.Context
import android.graphics.Canvas
import android.util.DisplayMetrics
import android.util.Log
import android.view.View
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.facebook.react.views.view.ReactViewGroup
import kotlin.math.max


/** Container for all RecyclerListView children. This will automatically remove all gaps and overlaps for GridLayouts with flexible spans.
 * Note: This cannot work for masonry layouts i.e, pinterest like layout */
class AutoLayoutView(context: Context) : ReactViewGroup(context) {
    val alShadow = AutoLayoutShadow()
    var enableInstrumentation = false

    var pixelDensity = 1.0;

    /** Overriding draw instead of onLayout. RecyclerListView uses absolute positions for each and every item which means that changes in child layouts may not trigger onLayout on this container. The same layout
     * can still cause views to overlap. Therefore, it makes sense to override draw to do correction. */
    override fun dispatchDraw(canvas: Canvas?) {
        fixLayout()
        super.dispatchDraw(canvas)

        if (enableInstrumentation) {
            // Since we need to call this method with scrollOffset on the UI thread and not with the one react has we're querying parent's parent
            // directly which will be a ScrollView. If it isn't reported values will be incorrect but the component will not break.
            // RecyclerListView is expected not to change the hierarchy of children.
            alShadow.computeBlankFromGivenOffset((parent.parent as View).let {
                if (alShadow.horizontal) it.scrollX else it.scrollY
            })
            emitBlankAreaEvent()
        }
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

    /** TODO: Check migration to Fabric */
    private fun emitBlankAreaEvent() {
        val event: WritableMap = Arguments.createMap()
        val blanks: WritableMap = Arguments.createMap()
        blanks.putDouble("offsetStart", alShadow.blankOffsetAtStart / pixelDensity)
        blanks.putDouble("offsetEnd", alShadow.blankOffsetAtEnd / pixelDensity)
        event.putMap("blanks", blanks)
        val reactContext = context as ReactContext
        reactContext
                .getJSModule(RCTEventEmitter::class.java).receiveEvent(id, Constants.EVENT_BLANK_AREA, event)
    }
}
