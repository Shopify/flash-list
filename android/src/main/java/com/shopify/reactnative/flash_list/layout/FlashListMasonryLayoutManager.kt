package com.shopify.reactnative.flash_list.layout

import android.content.Context
import androidx.recyclerview.widget.StaggeredGridLayoutManager

/**
 * Masonry/waterfall layout manager based on StaggeredGridLayoutManager.
 * Each column can have items of different heights, creating a
 * Pinterest-style layout. Items are placed in the shortest column.
 */
class FlashListMasonryLayoutManager(
    context: Context,
    spanCount: Int,
    reverseLayout: Boolean = false,
    private val drawDistance: Int = 250
) : StaggeredGridLayoutManager(spanCount, VERTICAL) {

    init {
        this.reverseLayout = reverseLayout
        gapStrategy = GAP_HANDLING_MOVE_ITEMS_BETWEEN_SPANS
    }

    override fun supportsPredictiveItemAnimations(): Boolean {
        return false
    }
}
