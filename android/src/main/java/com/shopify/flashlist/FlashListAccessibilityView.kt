package com.shopify.flashlist

import android.content.Context
import android.view.View
import com.facebook.react.views.view.ReactViewGroup

internal class FlashListAccessibilityView(context: Context) : ReactViewGroup(context) {
    var reverseAccessibilityOrder: Boolean = false

    override fun addChildrenForAccessibility(outChildren: ArrayList<View>) {
        if (!reverseAccessibilityOrder) {
            super.addChildrenForAccessibility(outChildren)
            return
        }

        val children = ArrayList<View>()
        super.addChildrenForAccessibility(children)
        children.reverse()
        outChildren.addAll(children)
    }
}
