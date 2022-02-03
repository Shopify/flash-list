package com.shopify.reactnative.recycler_flat_list

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.views.view.ReactViewGroup
import com.facebook.react.views.view.ReactViewManager

@ReactModule(name = BlankAreaViewManager.REACT_CLASS)
class BlankAreaViewManager: ReactViewManager() {
    companion object {
        const val REACT_CLASS = "BlankAreaView"
    }

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(context: ThemedReactContext): ReactViewGroup {
        return BlankAreaView(context)
    }
}
