package com.shopify.reactnative.recycler_flat_list

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class ReactNativeRecyclerFlatListPackage : ReactPackage {
  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
    return listOf()
  }

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return listOf(
        AutoLayoutViewManager(),
        CellContainerManager(),
        BlankAreaViewManager(),
        RecyclerFlatListPerformanceViewManager()
    )
  }
}
