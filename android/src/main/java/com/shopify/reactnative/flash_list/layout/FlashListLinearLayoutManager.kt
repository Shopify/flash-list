package com.shopify.reactnative.flash_list.layout

import android.content.Context
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView

/**
 * Linear layout manager with extra draw distance for pre-rendering items
 * beyond the visible area, reducing blank space during fast scrolling.
 */
class FlashListLinearLayoutManager(
    context: Context,
    orientation: Int = RecyclerView.VERTICAL,
    reverseLayout: Boolean = false,
    private val drawDistance: Int = 250
) : LinearLayoutManager(context, orientation, reverseLayout) {

    override fun calculateExtraLayoutSpace(state: RecyclerView.State, extraLayoutSpace: IntArray) {
        extraLayoutSpace[0] = drawDistance
        extraLayoutSpace[1] = drawDistance
    }

    override fun supportsPredictiveItemAnimations(): Boolean {
        return false
    }
}
