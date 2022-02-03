package com.shopify.reactnative.recycler_flat_list

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.common.MapBuilder
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
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
        return BlankAreaView(context)
    }
}
