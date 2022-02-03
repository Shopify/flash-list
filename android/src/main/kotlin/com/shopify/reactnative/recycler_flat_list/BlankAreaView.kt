package com.shopify.reactnative.recycler_flat_list

import android.content.Context
import android.graphics.Canvas
import android.util.DisplayMetrics
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.view.ViewTreeObserver
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.views.view.ReactViewGroup
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import com.facebook.react.uimanager.events.RCTEventEmitter
import kotlin.math.max


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
    private var didLoadCells = false
    private var didSendInteractiveEvent = false

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        val dm = DisplayMetrics()
        display.getRealMetrics(dm)
        pixelDensity = dm.density.toDouble()
        viewTreeObserver.addOnDrawListener {
            if (scrollView as View? != null) {
                val (blankOffsetTop, blankOffsetBottom) = computeBlankFromGivenOffset()
                if (!didSendInteractiveEvent && max(blankOffsetBottom, blankOffsetTop) == 0) {
                    didSendInteractiveEvent = true
                    Log.d("BlankAreaView", "Send interactive event from native")
                    val reactContext = context as ReactContext
                    reactContext
                            .getJSModule(RCTDeviceEventEmitter::class.java)
                            .emit("onInteractive", Arguments.createMap())
                }
                emitBlankAreaEvent(blankOffsetTop, blankOffsetBottom)
            }
        }
    }

    fun computeBlankFromGivenOffset(): Pair<Int, Int> {
//       val cells = ((scrollView as ViewGroup).getChildAt(0) as ViewGroup).getChildren().filterNotNull().map { it as ViewGroup }
//        Log.d("BlankAreaView", ((scrollView as ViewGroup).getChildAt(0) as ViewGroup).getChildren().first().toString())
        val cells = (((scrollView as ViewGroup).getChildAt(0) as ViewGroup).getChildren().first() as ViewGroup)
                .getChildren().filterNotNull()
                .map { it as ViewGroup }
                .toTypedArray()
        cells.sortBy { it.top }
        if (cells.isEmpty()) {
            return Pair(0, 0)
        }
        didLoadCells = true

        try {
            val firstCell = cells.first { isWithinBounds(it) && it.getChildren().isNotEmpty() }
            val lastCell = cells.last { isWithinBounds(it) && it.getChildren().isNotEmpty() }
            val blankOffsetTop = firstCell.top - scrollOffset
            val blankOffsetBottom = scrollOffset + listSize - lastCell.bottom
            return Pair(blankOffsetTop, blankOffsetBottom)
        } catch (e: NoSuchElementException) {
            return Pair(0, listSize)
        }
    }

    private fun emitBlankAreaEvent(blankOffsetTop: Int, blankOffsetBottom: Int) {
        val event: WritableMap = Arguments.createMap()
        event.putDouble("offsetStart", blankOffsetTop / pixelDensity)
        event.putDouble("offsetEnd", blankOffsetBottom / pixelDensity)
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
