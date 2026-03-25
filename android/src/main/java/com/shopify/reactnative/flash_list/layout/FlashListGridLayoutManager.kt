package com.shopify.reactnative.flash_list.layout

import android.content.Context
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView

/**
 * Grid layout manager with extra draw distance and span support.
 * Used for numColumns > 1 layouts. Supports variable span sizes
 * per item via SpanSizeLookup.
 */
class FlashListGridLayoutManager(
    context: Context,
    spanCount: Int,
    orientation: Int = RecyclerView.VERTICAL,
    reverseLayout: Boolean = false,
    private val drawDistance: Int = 250
) : GridLayoutManager(context, spanCount, orientation, reverseLayout) {

    override fun calculateExtraLayoutSpace(state: RecyclerView.State, extraLayoutSpace: IntArray) {
        extraLayoutSpace[0] = drawDistance
        extraLayoutSpace[1] = drawDistance
    }

    override fun supportsPredictiveItemAnimations(): Boolean {
        return false
    }
}
