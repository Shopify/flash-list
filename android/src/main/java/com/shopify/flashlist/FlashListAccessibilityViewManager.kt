package com.shopify.flashlist

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.views.view.ReactViewGroup
import com.facebook.react.views.view.ReactViewManager

@ReactModule(name = FlashListAccessibilityViewManager.NAME)
internal class FlashListAccessibilityViewManager : ReactViewManager() {
    companion object {
        const val NAME = "FlashListAccessibilityView"
    }

    override fun getName(): String = NAME

    override fun createViewInstance(context: ThemedReactContext): ReactViewGroup =
        FlashListAccessibilityView(context)

    @ReactProp(name = "reverseAccessibilityOrder", defaultBoolean = false)
    fun setReverseAccessibilityOrder(view: ReactViewGroup, reverse: Boolean) {
        (view as FlashListAccessibilityView).reverseAccessibilityOrder = reverse
    }
}
