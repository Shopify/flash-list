package com.flatlistpro

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.views.view.ReactViewGroup
import com.facebook.react.views.view.ReactViewManager

@ReactModule(name = AutoLayoutViewManager.REACT_CLASS)
class AutoLayoutViewManager: ReactViewManager() {

    companion object {
        const val REACT_CLASS = "AutoLayoutView"
    }

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(context: ThemedReactContext): ReactViewGroup {
        return AutoLayoutView(context)
    }

    @ReactProp(name = "horizontal")
    fun setHorizontal(view: AutoLayoutView, isHorizontal: Boolean) {
        view.horizontal = isHorizontal
    }

    @ReactProp(name = "scrollOffset")
    fun setScrollOffset(view: AutoLayoutView, scrollOffset: Int) {
        view.scrollOffset = scrollOffset
    }

    @ReactProp(name = "windowSize")
    fun setWindowSize(view: AutoLayoutView, windowSize: Int) {
        view.windowSize = windowSize
    }
}