package com.shopify.reactnative.flash_list

import android.content.Context
import android.view.View
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

//    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
//        super.onLayout(changed, left, top, right, bottom)
//        if(changed) {
////            (parent as View).invalidate()
//
//            (parent as? AutoLayoutView)?.invalidateScrollView()
//        }
//    }

    override fun setStableId(stableId: String) {
        this.stableId = stableId
    }

    override fun getStableId(): String {
        return this.stableId
    }
}
