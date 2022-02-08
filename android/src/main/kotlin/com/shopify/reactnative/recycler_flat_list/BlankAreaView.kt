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
import com.facebook.react.uimanager.events.RCTEventEmitter
import java.util.*
import kotlin.NoSuchElementException
import kotlin.math.max
import kotlin.math.min


class BlankAreaView(context: Context) : ReactViewGroup(context) {
    val scrollView: View?
        get() {
            return try {
                getChildAt(0)
            } catch (e: NullPointerException) {
                null
            }
        }

    var getCells: () -> Array<View> = { emptyArray() }

    private val horizontal: Boolean
        get() {
            return false
        }

    private val listSize: Int
        get() {
            if (scrollView == null) {
                return 0
            }
            return if (horizontal) scrollView!!.width else scrollView!!.height
        }

    private val scrollOffset: Int
        get() {
            if (scrollView == null) {
                return 0
            }
            return if (horizontal) scrollView!!.scrollX else scrollView!!.scrollY
        }
    private var didLoadCells = false
    private var didSendInteractiveEvent = false
    private var pixelDensity = 1.0;

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        val dm = DisplayMetrics()
        display.getRealMetrics(dm)
        pixelDensity = dm.density.toDouble()
        viewTreeObserver.addOnScrollChangedListener {
            if (scrollView == null) {
                return@addOnScrollChangedListener
            }
            val (blankOffsetTop, blankOffsetBottom) = computeBlankFromGivenOffset()
            emitBlankAreaEvent(blankOffsetTop, blankOffsetBottom)
        }
        viewTreeObserver.addOnDrawListener {
            if (didSendInteractiveEvent) {
                return@addOnDrawListener
            }
            val (blankOffsetTop, blankOffsetBottom) = computeBlankFromGivenOffset()
            if (max(blankOffsetBottom, blankOffsetTop) != 0 || !didLoadCells) {
                return@addOnDrawListener
            }
            didSendInteractiveEvent = true
            val reactContext = context as ReactContext
            reactContext
                    .getJSModule(RCTEventEmitter::class.java)
                    .receiveEvent(
                            id,
                            "onInteractive",
                            Arguments.createMap().apply {
                                putString("timestamp", Date().time.toString())
                            }
                    )
        }
    }

    private fun computeBlankFromGivenOffset(): Pair<Int, Int> {
        val cells = getCells()
        cells.sortBy { it.top }
        if (cells.isEmpty()) {
            return Pair(0, listSize)
        }
        didLoadCells = true

        return try {
            val firstCell = cells.first { isRenderedAndVisibleCell(it) }
            val lastCell = cells.last { isRenderedAndVisibleCell(it) }
            val blankOffsetTop = firstCell.top - scrollOffset
            val blankOffsetBottom = min((firstCell.parent as View).bottom, scrollOffset + listSize) - lastCell.bottom
            Pair(blankOffsetTop, blankOffsetBottom)
        } catch (e: NoSuchElementException) {
            Pair(0, listSize)
        }
    }

    private fun isRenderedAndVisibleCell(cell: View): Boolean {
        if (!isWithinBounds(cell)) {
            return false
        }
        if (cell !is ViewGroup) {
            return true
        }
        return cell.childCount != 0
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
        if (scrollView == null) {
            return false
        }
        val scrollView = scrollView as View
        return if (!horizontal) {
            (view.top >= (scrollView.scrollY - scrollView.height) || view.bottom >= (scrollView.scrollY - scrollView.height)) &&
                    (view.top <= scrollView.scrollY + scrollView.height || view.bottom <= scrollView.scrollY + scrollView.height)
        } else {
            (view.left >= (scrollView.scrollX - scrollView.width) || view.right >= (scrollView.scrollX - scrollView.width)) &&
                    (view.left <= scrollView.scrollX + listSize || view.right <= scrollView.scrollX + scrollView.width)
        }
    }

    fun ViewGroup.getChildren(): Array<View> {
        return (0..childCount).mapNotNull {
            this.getChildAt(it)
        }
        .toTypedArray()
    }
}
