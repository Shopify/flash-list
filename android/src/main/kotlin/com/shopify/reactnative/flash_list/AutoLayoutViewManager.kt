package com.shopify.reactnative.flash_list

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.AutoLayoutViewManagerDelegate
import com.facebook.react.viewmanagers.AutoLayoutViewManagerInterface
import kotlin.math.roundToInt

/** ViewManager for AutoLayoutView - Container for all RecyclerListView children. Automatically removes all gaps and overlaps for GridLayouts with flexible spans.
 * Note: This cannot work for masonry layouts i.e, pinterest like layout */
@ReactModule(name = AutoLayoutViewManager.REACT_CLASS)
class AutoLayoutViewManager: ViewGroupManager<AutoLayoutView>(), AutoLayoutViewManagerInterface<AutoLayoutView> {
    private val mDelegate: AutoLayoutViewManagerDelegate<AutoLayoutView, AutoLayoutViewManager> =
        AutoLayoutViewManagerDelegate(this)

    companion object {
        const val REACT_CLASS = "AutoLayoutView"
    }

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun getDelegate(): ViewManagerDelegate<AutoLayoutView> = mDelegate

    override fun createViewInstance(context: ThemedReactContext): AutoLayoutView {
        return AutoLayoutView(context).also { it.pixelDensity = context.resources.displayMetrics.density.toDouble() }
    }

    override fun getExportedCustomDirectEventTypeConstants() = mutableMapOf(
        "onBlankAreaEvent" to mutableMapOf("registrationName" to "onBlankAreaEvent"),
    )

    @ReactProp(name = "horizontal")
    override fun setHorizontal(view: AutoLayoutView, isHorizontal: Boolean) {
        view.alShadow.horizontal = isHorizontal
    }

    @ReactProp(name = "disableAutoLayout")
    override fun setDisableAutoLayout(view: AutoLayoutView, disableAutoLayout: Boolean) {
        view.disableAutoLayout = disableAutoLayout
    }

    @ReactProp(name = "scrollOffset")
    override fun setScrollOffset(view: AutoLayoutView, scrollOffset: Double) {
        view.alShadow.scrollOffset = convertToPixelLayout(scrollOffset, view.pixelDensity)
    }

    @ReactProp(name = "windowSize")
    override fun setWindowSize(view: AutoLayoutView, windowSize: Double) {
        view.alShadow.windowSize = convertToPixelLayout(windowSize, view.pixelDensity)
    }

    @ReactProp(name = "renderAheadOffset")
    override fun setRenderAheadOffset(view: AutoLayoutView, renderOffset: Double) {
        view.alShadow.renderOffset = convertToPixelLayout(renderOffset, view.pixelDensity)
    }

    @ReactProp(name = "enableInstrumentation")
    override fun setEnableInstrumentation(view: AutoLayoutView, enableInstrumentation: Boolean) {
        view.enableInstrumentation = enableInstrumentation
    }

    private fun convertToPixelLayout(dp: Double, density: Double): Int {
        return (dp * density).roundToInt()
    }
}
