package com.shopify.reactnative.recycler_flat_list

import android.view.View
import android.view.ViewGroup
import com.facebook.react.common.MapBuilder
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.views.view.ReactViewGroup
import com.facebook.react.views.view.ReactViewManager

@ReactModule(name = RecyclerFlatListPerformanceViewManager.REACT_CLASS)
class RecyclerFlatListPerformanceViewManager: ReactViewManager() {
    companion object {
        const val REACT_CLASS = "RecyclerFlatListPerformanceView"
    }

    override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any> {
        return MapBuilder.builder<String, Any>().put(
                Constants.EVENT_BLANK_AREA,
                MapBuilder.of("registrationName", Constants.EVENT_BLANK_AREA)
        ).build()
    }

    override fun getExportedCustomBubblingEventTypeConstants(): Map<String, Any> {
        return MapBuilder.builder<String, Any>().put(
                "onInteractive",
                MapBuilder.of(
                        "phasedRegistrationNames",
                        MapBuilder.of("bubbled", "onInteractive")
                )
        ).build();
    }

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(context: ThemedReactContext): ReactViewGroup {
        return BlankAreaView(context).apply {
            getCells = {
                if (scrollView == null) {
                    emptyList()
                } else {
                    val container = ((scrollView as ViewGroup).getChildAt(0) as ViewGroup)
                    val autoLayoutView = (container.getChildren().first() as ViewGroup)
                    autoLayoutView.getChildren() + container.getChildren().filter { it !is AutoLayoutView }
                }
            }
        }
    }
}
