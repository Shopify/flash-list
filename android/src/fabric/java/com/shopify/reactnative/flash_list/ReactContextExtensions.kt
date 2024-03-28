package com.shopify.reactnative.flash_list

import com.facebook.react.bridge.ReactContext
import com.facebook.react.fabric.FabricUIManager
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.common.UIManagerType
import com.facebook.react.bridge.WritableMap

fun ReactContext.dispatchEvent(nativeTag: Int, eventName: String, event: WritableMap) {
    val fabricUIManager = UIManagerHelper.getUIManager(this, UIManagerType.FABRIC) as FabricUIManager
    fabricUIManager.receiveEvent(nativeTag, eventName, event)
}
