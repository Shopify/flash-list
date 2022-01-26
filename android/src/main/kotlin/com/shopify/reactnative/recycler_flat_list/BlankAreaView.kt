package com.shopify.reactnative.recycler_flat_list

import android.content.Context
import android.graphics.Canvas
import android.util.DisplayMetrics
import android.util.Log
import android.view.View
import android.view.ViewGroup
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.views.view.ReactViewGroup
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter


class BlankAreaView(context: Context) : ReactViewGroup(context) {
    private var pixelDensity = 1.0;

    private val scrollView: View
        get() {
            return getChildAt(0)
        }

    private val horizontal: Boolean
        get() {
            return false
        }

    private val listSize: Int
        get() {
            return if (horizontal) scrollView.width else scrollView.height
        }

    private val scrollOffset: Int
        get() {
            return if (horizontal) scrollView.scrollX else scrollView.scrollY
        }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        val dm = DisplayMetrics()
        display.getRealMetrics(dm)
        pixelDensity = dm.density.toDouble()
    }

    override fun dispatchDraw(canvas: Canvas?) {
        super.dispatchDraw(canvas)

        val (blankOffsetTop, blankOffsetBottom, blankArea) = computeBlankFromGivenOffset()
        emitBlankAreaEvent(blankOffsetTop, blankOffsetBottom, blankArea)
    }

    fun computeBlankFromGivenOffset(): Triple<Int, Int, Int> {
        val cells = ((scrollView as ViewGroup).getChildAt(0) as ViewGroup).getChildren().filter { it != null } .map { it as ViewGroup }
        if (cells.isEmpty()) {
            return Triple(0, 0, 0)
        }

        try {
            val firstCell = cells.first { isWithinBounds(it) && it.getChildren().isNotEmpty() }
            val lastCell = cells.last { isWithinBounds(it) && it.getChildren().isNotEmpty() }
            val blankOffsetTop = firstCell.top - scrollOffset
            val blankOffsetBottom = scrollOffset + listSize - lastCell.bottom
            val blankArea = Math.max(blankOffsetTop, blankOffsetBottom)
            return Triple(blankOffsetTop, blankOffsetBottom, blankArea)
        } catch (e: NoSuchElementException) {
            return Triple(listSize, listSize, listSize)
        }
    }

    private fun emitBlankAreaEvent(blankOffsetTop: Int, blankOffsetBottom: Int, blankArea: Int) {
        val event: WritableMap = Arguments.createMap()
        event.putDouble("startOffset", blankOffsetTop / pixelDensity)
        event.putDouble("endOffset", blankOffsetBottom / pixelDensity)
        event.putDouble("blankArea", blankArea / pixelDensity)
        event.putDouble("listSize", listSize / pixelDensity)
        val reactContext = context as ReactContext
        reactContext
            .getJSModule(RCTDeviceEventEmitter::class.java)
            .emit(Constants.EVENT_BLANK_AREA, event)
    }

    private fun isWithinBounds(view: View): Boolean {
        return if (!horizontal) {
            (view.top >= (scrollView.scrollY - scrollView.height) || view.bottom >= (scrollView.scrollY - scrollView.height)) &&
                    (view.top <= scrollView.scrollY + scrollView.height || view.bottom <= scrollView.scrollY + scrollView.height)
        } else {
            (view.left >= (scrollView.scrollX - scrollView.width) || view.right >= (scrollView.scrollX - scrollView.width)) &&
                    (view.left <= scrollView.scrollX + listSize || view.right <= scrollView.scrollX + scrollView.width)
        }
    }

    private fun ViewGroup.getChildren(): List<View?> {
        return (0..childCount).map {
            this.getChildAt(it)
        }
    }
}
