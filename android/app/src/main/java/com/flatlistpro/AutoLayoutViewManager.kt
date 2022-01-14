package com.flatlistpro

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.views.view.ReactViewGroup
import com.facebook.react.views.view.ReactViewManager
import com.facebook.react.common.MapBuilder




/** ViewManager for AutoLayoutView - Container for all RecyclerListView children. Automatically removes all gaps and overlaps for GridLayouts with flexible spans.
 * Note: This cannot work for masonry layouts i.e, pinterest like layout */
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

    override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any> {
        return MapBuilder.builder<String, Any>().put(
                "instrumentation",
                MapBuilder.of("registrationName", "onReceiveInstrumentation")
        ).build()
    }

    @ReactProp(name = "horizontal")
    fun setHorizontal(view: AutoLayoutView, isHorizontal: Boolean) {
        view.alShadow.horizontal = isHorizontal
    }

    @ReactProp(name = "scrollOffset")
    fun setScrollOffset(view: AutoLayoutView, scrollOffset: Int) {
        view.alShadow.scrollOffset = scrollOffset
    }

    @ReactProp(name = "windowSize")
    fun setWindowSize(view: AutoLayoutView, windowSize: Int) {
        view.alShadow.windowSize = windowSize
    }
    @ReactProp(name = "renderAheadOffset")
    fun setRenderAheadOffset(view: AutoLayoutView, renderOffset: Int) {
        view.alShadow.renderOffset = renderOffset
    }
    @ReactProp(name = "enableInstrumentation")
    fun setEnableInstrumentation(view: AutoLayoutView, enableInstrumentation: Boolean) {
        view.enableInstrumentation = enableInstrumentation
    }
}