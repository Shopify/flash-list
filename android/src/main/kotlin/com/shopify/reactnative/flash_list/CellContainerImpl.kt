package com.shopify.reactnative.flash_list

import android.content.Context
import com.facebook.react.views.view.ReactViewGroup

class CellContainerImpl(context: Context) : ReactViewGroup(context), CellContainer {
    private var index = -1
    private var stableId = ""

    override fun setIndex(value: Int) {
        index = value
    }

    override fun getIndex(): Int {
        return index
    }

    override fun setStableId(stableId: String) {
        this.stableId = stableId
    }

    override fun getStableId(): String {
        return this.stableId
    }
}
